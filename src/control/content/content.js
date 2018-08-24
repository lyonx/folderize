import React, { Component } from 'react';
import Page from './Components/Page';
import debounce from 'lodash.debounce';

class Content extends Component {
	constructor(props) {
		super(props);

		this.addPage = this.addPage.bind(this);
		this.deletePage = this.deletePage.bind(this);
		this.updatePage = this.updatePage.bind(this);
		this.addImg = this.addImg.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleNodeChange = this.handleNodeChange.bind(this);
		this.addNode = this.addNode.bind(this);
		this.addImg = this.addImg.bind(this);
		this.colorPicker = this.colorPicker.bind(this);
		this.reorderNodes = this.reorderNodes.bind(this);

		this.renderPages = this.renderPages.bind(this);
		this.debounceSync = debounce(this.syncState, 100);

		this.editor = {};
		this.state = {
			// tutorials: false,
			settings: {
				pages: [],
				options: {
					headerImg: false,
					headerImgSrc: 'https://via.placeholder.com/350x150',
					backgroundImg: '',
					backgroundLrg: '',
					renderTitlebar: true,
					navPosition: 'top',
					layout: 0
				}
			}
		};
	}

	// ----------------------- LIFECYCLE METHODS ----------------------- //

	// ON MOUNT, LOOKS FOR ANY PREVIOUSLY SAVED SETTINGS
	componentDidMount() {
		// this.debugDB();
		// debugger
		this.initSortable();



		// this.debugDB();

		buildfire.datastore.get('data', (err, response) => {
			if (err) throw err;
			// if none are present, insert default data
			//

			if (!response.id) {
				this.addPage();
				// this.setState({
				// 	settings: {
				// 		pages: [
				// 			{
				// 				title: 'new page',
				// 				id: Date.now(),
				// 				customizations: [],
				// 				backgroundColor: {
				// 					colorType: false,
				// 					solid: {
				// 						backgroundCSS: ''
				// 					},
				// 					gradient: {
				// 						backgroundCSS: ''
				// 					}
				// 				},
				// 				nodes: [
				// 					{
				// 						type: 'header',
				// 						data: {
				// 							text: 'new page'
				// 						}
				// 					}
				// 				]
				// 			}
				// 		],
				// 		options: {
				// 			showTitleBar: false,
				// 			navPosition: 'top',
				// 			colorOverrides: []
				// 		}
				// 	}
				// });
			} else {
				// otherwise, if all pages have been removed, insert default data
				if (response.data.settings.pages.length === 0) {
					this.addPage();
					// setTimeout(() => {
					// 	document.querySelector(`#tab0`).click();
					// }, 250);
				} else {
					// update settings
					this.setState({
						settings: response.data.settings
					});
				}
			}
		});
		// let tutorials = localStorage.getItem('tutorial');
		// if (tutorials === 'true') {
		// 	let tutorials = this.state.tutorials;
		// 	tutorials = true;
		// 	this.setState({
		// 		tutorials
		// 	});
		// } else {
		// 	let tutorials = this.state.tutorials;
		// 	tutorials = false;
		// 	this.setState({
		// 		tutorials
		// 	});
		// }

	}
	// EVERY TIME THE STATE CHANGES, SYNC STATE WITH DB
	componentDidUpdate() {
		// DEBOUNCER THAT RUNS THIS.SYNCSTATE
		console.warn(this.state);

		this.debounceSync();
		this.editor.loadItems(this.state.settings.pages, false, false);
	}
	// ------------------------- DATA HANDLING ------------------------- //

	// SYNCS THE CONTENT STATE WITH THE DB
	syncState() {
		buildfire.datastore.get('data', (err, response) => {
			if (err) throw err;

			if (!response.id) {
				buildfire.datastore.insert(
					{
						settings: this.state.settings
					},
					'data',
					true,
					(err, status) => {
						if (err) throw err;
					}
				);
				return;
			} else {
				// insert pages into db
				buildfire.datastore.update(
					response.id,
					{
						settings: this.state.settings
					},
					'data',
					(err, status) => {
						if (err) {
							throw err;
						}
					}
				);
			}
		});
	}
	// SETS UP THE SORTABLE LIST OF PAGES
	initSortable() {
		let navigationCallback = e => {
			let target = this.state.settings.pages.filter(page => {
				return page.instanceId === e.instanceId;
			});
			let index = this.state.settings.pages.indexOf(target[0]);
			buildfire.messaging.sendMessageToWidget({
				index
			});
			document.querySelector(`#tab${index}`).click();
		};
		this.editor = new buildfire.components.pluginInstance.sortableList(
			'#pages',
			[],
			{
				confirmDeleteItem: true
			},
			false,
			false,
			{
				itemEditable: true,
				navigationCallback
			}
		);

		this.editor.onOrderChange = () => {
			let settings = this.state.settings;
			settings.pages = this.editor.items;
			this.setState({
				settings
			});
		};

		this.editor.onAddItems = e => {};

		this.editor.onDeleteItem = () => {
			let settings = this.state.settings;
			settings.pages = this.editor.items;
			//
			this.setState({
				settings
			});
		};
	}
	// (DEV ONLY) MUST BE RUN ONCE WHEN DATA STRUCTURE CHANGES
	debugDB() {
		(() => {
			buildfire.datastore.get('data', (err, response) => {
				if (err) throw err;
				//

				// insert pages into db
				buildfire.datastore.update(
					response.id,
					{
						settings: this.state.settings
					},
					'data',
					(err, status) => {
						if (err) {
							throw err;
						}
					}
				);
			});
		})();
	}

	// ----------------- PAGE CONFIGURATION AND METHODS ---------------- //

	// ADDS A NEW PAGE TO THE STATE
	addPage() {
		if (this.state.settings.pages.length === 0) {
			// if (localStorage.getItem('tutorial') === 'true') {
			// localStorage.setItem('tutorial', false);
			// let tutorials = this.state.tutorials;
			// tutorials = false;
			// this.setState({ tutorials });
			// return;
		}

		// localStorage.setItem('tutorial', true);
		// let tutorials = this.state.tutorials;
		// tutorials = true;
		// this.setState({ tutorials });
		// } else {
		// localStorage.setItem('tutorial', false);
		// let tutorials = this.state.tutorials;
		// tutorials = false;
		// this.setState({ tutorials });
		// }

		let newPage = {
			title: 'New Page',
			instanceId: Date.now(),
			backgroundColor: {
				colorType: false,
				solid: {
					backgroundCSS: ''
				},
				gradient: {
					backgroundCSS: ''
				}
			},
			nodes: [
				{
					type: 'header',
					title: 'Header',
					instanceId: Date.now(),
					data: {
						text: 'new page'
					}
				}
			]
		};
		let settings = this.state.settings;
		settings.pages.push(newPage);
		this.setState({
			settings
		});
		// if (pages.length > 1) {
		setTimeout(() => {
			document.querySelector(`#tab${settings.pages.length - 1}`).click();
		}, 250);
		setTimeout(() => {
			buildfire.messaging.sendMessageToWidget({
				index: settings.pages.length - 1
			});
		}, 750);
	}
	// USED BY THE PAGES TO DELETE THEMSELVES
	deletePage(index) {
		let settings = this.state.settings;
		settings.pages.splice(index, 1);
		document.querySelector(`#tab${index}`).click();
		this.setState({ settings });
	}
	// USED BY THE PAGES TO UPDATE THEIR DATA IN CONTENT STATE
	updatePage(index, page, updateAll) {
		if (!updateAll) {
			updateAll = false;
			let settings = this.state.settings;
			// let pages = this.state.settings.pages;
			settings.pages[index] = page;
			this.setState({
				settings
			});
		} else {
			let settings = this.state.settings;
			settings.pages.map(existingPage => {
				if (page.backgroundColor) existingPage.backgroundColor = page.backgroundColor;
				if (page.backgroundImg) existingPage.backgroundImg = page.backgroundImg;
			});
			this.setState({
				settings
			});
		}
	}
	// ADDS A NODE OBJECT OF THE CORRESPONDING TYPE
	addNode(type, index, callback) {
		let settings = this.state.settings;
		let nodes = settings.pages[index].nodes;
		switch (type) {
			case 'header': {
				nodes.push({
					type: 'header',
					title: 'Header',
					instanceId: Date.now(),
					data: { text: 'new page', border: true }
				});
				this.setState({ settings });
				setTimeout(() => {
					callback();
				}, 100);
				break;
			}
			case 'desc': {
				nodes.push({
					type: 'desc',
					title: 'Text',
					instanceId: Date.now(),
					data: { text: 'You can edit this description in the control.' }
				});
				this.setState({ settings });
				setTimeout(() => {
					callback();
				}, 100);
				break;
			}
			case 'image': {
				buildfire.imageLib.showDialog({}, (err, result) => {
					if (err) throw err;
					if (!result.selectedFiles[0]) return;
					nodes.push({
						type: 'image',
						title: 'Image',
						instanceId: Date.now(),
						data: { src: result.selectedFiles[0] }
					});
					this.setState({ settings });
					setTimeout(() => {
						callback();
					}, 100);
				});
				break;
			}
			case 'hero': {
				nodes.push({
					type: 'hero',
					title: 'hero',
					instanceId: Date.now(),
					data: { src: 'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjQ0MDV9&s=289571318ec59acf6bece7e8ece608af', header: 'Hero Header', subtext: 'Hero Subtext', showButton: false, buttonText: 'Go!' }
				});
				this.setState({ settings });
				setTimeout(() => {
					callback();
				}, 100);
				break;
			}
			case 'action': {
				buildfire.actionItems.showDialog({}, { showIcon: true }, (err, res) => {
					if (err) throw err;

					// let nodes = this.state.nodes;
					let title = res.title ? res.title : 'Untitled';
					nodes.push({
						type: 'action',
						instanceId: Date.now(),
						title: `Action Item: ${title}`,
						data: res
					});
					this.setState({ settings });
					setTimeout(() => {
						callback();
					}, 100);
					return;
				});
				break;
			}
			default:
				return;
		}
	}
	// USED BY INPUT FEILDS TO UPDATE STATE
	handleChange(event, index) {
		const target = event.target;
		const name = target.name;
		let settings = this.state.settings;
		settings.pages[index][name] = event.target.value;
		this.setState({
			settings
		});
	}
	// USED BY PAGES TO EDIT THEIR NODE DATA IN CONTENT
	handleNodeChange(event, index, attr, type, pageIndex) {
		if (!type) type = 'none';
		let settings = this.state.settings;
		let page = settings.pages[pageIndex];
		let nodes = page.nodes;
		let node = nodes[index];
		switch (attr) {
			case 'text': {
				node.data.text = event.target.value;
				nodes[index] = node;
				this.setState({ settings });
				break;
			}
			// combine these
			case 'src': {
				switch (node.type) {
					case 'plugin': {
						node.data.iconUrl = event;
						this.setState({ settings });
						break;
					}
					case 'image': {
						node.data.src = event;
						this.setState({ settings });
						break;
					}
					case 'hero': {
						node.data.src = event;
						this.setState({ settings });
						break;
					}
					case 'action': {
						node.data.iconUrl = event;
						this.setState({ settings });
						break;
					}
					default:
						return;
				}
				nodes[index] = node;
				this.setState({ settings });
				break;
			}
			case 'img': {
				console.log(event);
				if (typeof event === 'number') {
					node.data.height = event;
					this.setState({ settings });
					return;
				}
				if (event.target.checked) {
					switch (event.target.name) {
						case 'hero':
							node.format = 'hero';
							node.data.header = node.data.header || 'header';
							node.data.subtext = node.data.subtext || 'subtext';
							nodes[index] = node;
							break;
						case 'custom': {
							node.format = 'custom';
							node.data.height = node.data.height || 0.54;
							break;
						}
						default:
							break;
					}

					this.setState({ settings });
				} else {
					node.format = 'image';
					nodes[index] = node;
					this.setState({ settings });
				}
				break;
			}
			case 'delete': {
				// let confirm = window.confirm("Are you sure? Item will be lost!");

				buildfire.notifications.confirm(
					{
						title: 'Remove Node',
						message: 'Are you sure? Node will be lost!',
						buttonLabels: ['delete', 'cancel']
					},
					(err, result) => {
						if (err) {
							if (typeof err == 'boolean') {
								nodes.splice(index, 1);
								this.setState({ settings });
								// setTimeout(() => {
								// document.querySelector(`#page${pageIndex}node${index}`).click();
								// }, 100);
							} else {
								throw err;
							}
						} else {
							if (result.selectedButton.key === 'confirm') {
								nodes.splice(index, 1);
								this.setState({ settings });
								// setTimeout(() => {
								// 	document.querySelector(`#page${pageIndex}node${index}`).click();
								// }, 1000);
							}
						}
					}
				);
				break;
			}
			case 'plugin': {
				node.data.title = event.target.value;
				nodes[index] = node;
				this.setState({ settings });
				break;
			}
			case 'action': {
				node.data.title = `Action Item: ${event.target.value}`;
				nodes[index] = node;
				this.setState({ settings });
				break;
			}
			case 'icon': {
				node.data.iconUrl = event.target.value;
				nodes[index] = node;
				this.setState({ settings });
				break;
			}
			case 'hero-header': {
				node.data.header = event.target.value;
				nodes[index] = node;
				this.setState({ settings });
				break;
			}
			case 'hero-subtext': {
				node.data.subtext = event.target.value;
				nodes[index] = node;
				this.setState({ settings });
				break;
			}
			case 'hero-button': {
				node.data.showButton = event.target.value;
				nodes[index] = node;
				this.setState({ settings });
				break;
			}
			case 'layout': {
				node.data.layout = event.target.value;
				nodes[index] = node;
				this.setState({ settings });
				break;
			}
			case 'header': {
				switch (type) {
					case 'border':
						node.data.border = event.target.checked;
						nodes[index] = node;
						this.setState({ settings });
						break;
					// case 'fontSize': {
					// 	node.data.fontSize = event.target.value;
					// nodes[index] = node;
					// this.setState({
					// 	nodes
					// });
					// this.update();
					// 	break;
					// }
					default:
						break;
				}
				break;
			}
			default:
				return;
		}
	}
	// OPENS IMAGELIB DIALOG WITH SPECIFIC TARGET
	addImg(control, nodeIndex, pageIndex, remove) {
		if (!remove) remove = false;
		let settings = this.state.settings;
		switch (control) {
			case 'header': {
				if (remove) {
					settings.options.headerImgSrc = 'https://via.placeholder.com/350x150';
					this.setState({ settings });
					return;
				}
				buildfire.imageLib.showDialog({ multiSelection: false }, (err, res) => {
					if (err) throw err;
					if (!res.selectedFiles[0]) return;
					settings.options.headerImgSrc = res.selectedFiles[0];
					this.setState({ settings });
				});
				break;
			}
			case 'background': {
				if (remove) {
					settings.pages[pageIndex].backgroundImg = {};
					this.setState({ settings });
					return;
				}
				buildfire.imageLib.showDialog({ multiSelection: false }, (err, res) => {
					if (err) throw err;
					if (!res.selectedFiles[0]) return;
					settings.pages[pageIndex].backgroundImg = res.selectedFiles[0];
					this.setState({ settings });
				});
				break;
			}
			case 'plugin': {
				buildfire.imageLib.showDialog({ multiSelection: false }, (err, res) => {
					if (err) throw err;
					// this.setState({ backgroundImg: res.selectedFiles[0] });
					// this.update();
					this.handleNodeChange(res.selectedFiles[0], nodeIndex, 'src');
				});
				break;
			}
			case 'action': {
				buildfire.imageLib.showDialog({ multiSelection: false }, (err, result) => {
					if (err) throw err;
					// this.setState({ backgroundImg: res.selectedFiles[0] });
					// this.update();
					// this.handleNodeChange(res.selectedFiles[0], nodeIndex, 'src');
					settings.pages[pageIndex].nodes[nodeIndex].data.iconUrl = result.selectedFiles[0];
					this.setState({ settings });
				});
				break;
			}
			case 'icon': {
				if (remove) {
					settings.pages[pageIndex].iconUrl = '';
					this.setState({ settings });
					return;
				}
				buildfire.imageLib.showDialog({ multiSelection: false, showFiles: false }, (err, res) => {
					if (err) throw err;
					if (!res.selectedIcons[0]) return;

					settings.pages[pageIndex].iconUrl = res.selectedIcons[0];
					this.setState({ settings });
					// this.update();
					// this.handleNodeChange(res.selectedFiles[0], index, 'icon');
				});
				break;
			}
			case 'hero': {
				buildfire.imageLib.showDialog({ multiSelection: false, showFiles: false }, (err, res) => {
					if (err) throw err;
					// this.setState({ iconUrl: res.selectedIcons[0] });
					this.handleNodeChange(res.selectedFiles[0], nodeIndex, 'src');
					// this.update();
					// this.handleNodeChange(res.selectedFiles[0], index, 'icon');
				});
				break;
			}
			default: {
				buildfire.imageLib.showDialog({}, (err, result) => {
					if (err) throw err;
					if (result.selectedFiles.length === 0) return;
					// this.handleNodeChange(result.selectedFiles[0], nodeIndex, 'src');
					settings.pages[pageIndex].nodes[nodeIndex].data.src = result.selectedFiles[0];
					this.setState({ settings });
				});
			}
		}
	}
	// USED BY PAGES TO SELECT AND APPLY COLORS
	colorPicker(attr, index, remove) {
		let settings = this.state.settings;
		if (remove) {
			settings.pages[index].backgroundColor = { colorType: false, solid: { backgroundCSS: '' }, gradient: { backgroundCSS: '' } };
			settings.pages[index].backgroundCSS = false;
			// { backgroundColor: { colorType: false, solid: { backgroundCSS: '' }, gradient: { backgroundCSS: '' } }, backgroundCSS: false }
			this.setState({ settings });
			return;
		}
		buildfire.colorLib.showDialog(this.state.settings.pages[index].backgroundColor, {}, null, (err, res) => {
			if (err) throw err;
			let bgCSS;
			switch (res.colorType) {
				case 'solid': {
					bgCSS = res.solid.backgroundCSS;
					break;
				}
				case 'gradient': {
					bgCSS = res.gradient.backgroundCSS;
					break;
				}
			}
			settings.pages[index][attr] = res;
			settings.pages[index].backgroundCSS = bgCSS;
			this.setState({ settings });
		});
	}
	// USED BY THE PAGES TO CHANGE THEIR ORDER
	reorderNodes(index, nodes) {
		let settings = this.state.settings;
		settings.pages[index].nodes = nodes;
		this.setState({ settings });
	}

	// --------------------------- RENDERING --------------------------- //

	// LOOPS THROUGH AND RETURNS PAGES
	renderPages() {
		// if (this.state.settings.pages.length < 1) return;
		// let tutorials = JSON.parse(localStorage.getItem('tutorial'));
		let pages = [];
		this.state.settings.pages.map((page, index) => {
			pages.push(<Page key={index} index={index} handleChange={this.handleChange} handleNodeChange={this.handleNodeChange} addImg={this.addImg} colorPicker={this.colorPicker} reorderNodes={this.reorderNodes} addNode={this.addNode} updatePage={this.updatePage} deletePage={this.deletePage} data={page} reorderPages={this.reorderPages} />);
		});
		// return pages;

		return pages;
	}

	render() {
		let headerImgDiag = (
			<div className="main col-md-9 pull-right">
				<div className="border-radius-four border-grey">
					<div className="d-item">
						<div className="media-holder pull-left" onClick={() => this.addImg('header', false, false, false)}>
							<img src={this.state.settings.options.headerImgSrc ? this.state.settings.options.headerImgSrc : './assets/noImg.PNG'} />
						</div>
						<div className="copy pull-right">
							<div className="pull-right">
								<span className="btn-edit-icon btn-primary" style="display: inline-block" />
								<span className="btn-icon btn-delete-icon btn-danger transition-third" style="display: inline-block; margin-left: 5px; pointer-events: all;" onClick={() => this.addImg('header', false, false, true)}/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-12">
						<div className="item row margin-bottom-twenty clearfix">
							<div className="labels col-md-3 padding-right-zero pull-left" style="display: initial">
								<span title="Add a header Image to appear at the top of the plugin.">Header Image: </span>
								<input
									type="checkbox"
									name="header-img"
									onChange={e => {
										let settings = this.state.settings;
										switch (e.target.checked) {
											case true:
												settings.options.headerImg = true;
												this.setState({ settings });
												break;
											case false:
												settings.options.headerImg = false;
												this.setState({ settings });
												break;
											default:
												break;
										}
									}}
									checked={this.state.settings.options.headerImg}
								/>
							</div>
							{this.state.settings.options.headerImg ? headerImgDiag : false}
						</div>
					</div>
					<div className="col-md-12">
						<div className="panel panel-default">
							<div className="panel-body">
								<div className="col-md-12">
									<button title="Adds a new page to your plugin." className="btn btn-primary" style="width: 100%" onClick={this.addPage}>
										Add a Page{' '}
									</button>{' '}
								</div>{' '}
							</div>{' '}
						</div>{' '}
					</div>{' '}
					<div title="Your pages appear in order here. Click a page title to edit it, or drag to reorder." className="col-md-12" id="pages">
						{' '}
						{/* <h4 className="text-center">Pages</h4> */} {this.renderPages()}{' '}
					</div>{' '}
				</div>{' '}
			</div>
		);
	}
}

export default Content;
