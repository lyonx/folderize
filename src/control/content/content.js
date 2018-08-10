import React, { Component } from 'react';
import Page from './Components/Page';
import debounce from 'lodash.debounce';

class Content extends Component {
	constructor(props) {
		super(props);
		this.addPage = this.addPage.bind(this);
		this.addImg = this.addImg.bind(this);
		this.deletePage = this.deletePage.bind(this);
		this.updatePage = this.updatePage.bind(this);
		this.renderPages = this.renderPages.bind(this);
		this.reorderPages = this.reorderPages.bind(this);
		this.debounceSync = debounce(this.syncState, 100);
		this.editor = {};
		this.state = {
			settings: {
				pages: [],
				options: {
					renderTitlebar: true,
					navPosition: 'top',
					colorOverrides: []
				}
			}
		};
	}
	// ----------------------- PAGE CONFIGURATION ---------------------- //

	// USED BY THE PAGES TO CHANGE THEIR ORDER
	reorderPages(index, dir) {
		let pages = this.state.settings.pages;
		// let target = pages[index];

		if (dir === 1) {
			let temp = pages[index - 1];
			if (!temp) return;
			pages[index - 1] = pages[index];
			pages[index] = temp;
			this.setState({ pages });
		} else {
			let temp = pages[index + 1];
			if (!temp) return;
			pages[index + 1] = pages[index];
			pages[index] = temp;
			this.setState({ pages });
		}
		// this.render();
		// window.location.reload();
	}
	// ADDS A NEW PAGE TO THE STATE
	addPage() {
		// debugger
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
					title: 'header',
					instanceId: Date.now(),
					data: {
						text: 'new page'
					}
				}
			]
		};
		let pages = this.state.settings.pages;

		setTimeout(() => {
			document.querySelector(`#tab${pages.length - 1}`).click();
		}, 100); 
		setTimeout(() => {
			buildfire.messaging.sendMessageToWidget({index: pages.length});
		}, 1000);
		pages.push(newPage);
		this.setState({ pages: pages });
	}
	// USED BY THE PAGES TO DELETE THEMSELVES
	deletePage(index) {
		let pages = this.state.settings.pages;
		pages.splice(index, 1);
		this.setState({ pages: pages });
	}
	// USED BY THE PAGES TO UPDATE THEIR DATA IN CONTENT STATE
	updatePage(index, page) {
		let pages = this.state.settings.pages;
		pages[index] = page;
		this.setState({ pages: pages });
	}

	addImg() {
		buildfire.imageLib.showDialog({}, (err, result) => {
			if (err) throw err;
			this.setState({ image: result.selectedFiles[0] });
		});
	}

	// ------------------------- DATA HANDLING ------------------------- //

	// SYNCS THE CONTENT STATE WITH THE DB
	syncState() {
		buildfire.datastore.get('data', (err, response) => {
			if (err) throw err;
			// console.warn(response);

			if (!response.id) {
				buildfire.datastore.insert({ settings: this.state.settings }, 'data', true, (err, status) => {
					if (err) throw err;
				});
				return;
			} else {
				// insert pages into db
				buildfire.datastore.update(response.id, { settings: this.state.settings }, 'data', (err, status) => {
					if (err) {
						throw err;
					}
				});
			}
		});
	}
	// ON MOUNT, LOOKS FOR ANY PREVIOUSLY SAVED SETTINGS
	componentDidMount() {
		let navigationCallback = e => {
			// console.log(this.editor);
			let target = this.state.settings.pages.filter(page => {
				return page.instanceId === e.instanceId;
			});
			let index = this.state.settings.pages.indexOf(target[0]);
			buildfire.messaging.sendMessageToWidget({index});
			document.querySelector(`#tab${index}`).click();

		};
		this.editor = new buildfire.components.pluginInstance.sortableList('#pages', [], { confirmDeleteItem: false }, false, false, { itemEditable: true, navigationCallback });

		this.editor.onOrderChange = () => {
			let settings = this.state.settings;
			settings.pages = this.editor.items;
			// console.log(settings);
			this.setState({ settings });
		};

		this.editor.onDeleteItem = () => {
			let settings = this.state.settings;
			settings.pages = this.editor.items;
			// console.log(settings);
			this.setState({ settings });
		};

		// (() => {
		// 	buildfire.datastore.get('data', (err, response) => {
		// 		if (err) throw err;
		// 		// if none are present, insert default data
		// 		if (!response.id) return;
		// 		buildfire.datastore.delete(response.id, 'data', (err, status) => {
		// 			if (err) throw err;
		// 			console.log(status);
		// 		});
		// 	});
		// })();

		// (() => {
		// 	buildfire.datastore.search({ limit: 20 }, 'data', (err, response) => {
		// 		if (err) throw err;
		// 		// console.warn(response);
		// 	});
		// })();

		buildfire.datastore.get('data', (err, response) => {
			if (err) throw err;
			// if none are present, insert default data
			// console.warn(response);

			if (!response.id) {
				this.setState({
					settings: {
						pages: [
							{
								title: 'New Page',
								id: Date.now(),
								customizations: [],
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
										data: {
											text: 'new page'
										}
									}
								]
							}
						],
						options: {
							showTitleBar: false,
							navPosition: 'top',
							colorOverrides: []
						}
					}
				});
			} else {
				// otherwise, if all pages have been removed, insert default data
				if (response.data.settings.pages.length === 0) {
					this.addPage();
				} else {
					// update settings
					this.setState({ settings: response.data.settings });
				}
			}
		});
	}
	// EVERY TIME THE STATE CHANGES, SYNC STATE WITH DB
	componentDidUpdate() {
		console.warn(this.state);

		// DEBOUNCER THAT RUNS THIS.SYNCSTATE
		this.debounceSync();
		// CHANGES THE CHECKBOXES TO MATCH STATE
		// this.state.settings.options.navPosition === 'bottom' ? (document.getElementById('nav-pos-bottom').checked = true) : (document.getElementById('nav-pos-bottom').checked = false);
		// this.state.settings.options.navPosition === 'top' ? (document.getElementById('nav-pos-top').checked = true) : (document.getElementById('nav-pos-top').checked = false);
		// this.state.settings.options.renderTitlebar === true ? (document.getElementById('titlebar').checked = true) : (document.getElementById('titlebar').checked = false);
		if (this.state.settings.pages.length < 1) return;
		this.editor.loadItems(this.state.settings.pages, false);
		document.querySelector('.carousel-items > div').onClick = e => {
			// console.log(e);
		};
	}

	// --------------------------- RENDERING --------------------------- //

	// LOOPS THROUGH AND RETURNS PAGES
	renderPages() {
		if (this.state.settings.pages.length < 1) return;
		let pages = [];
		this.state.settings.pages.map(page => {
			pages.push(<Page index={this.state.settings.pages.indexOf(page)} updatePage={this.updatePage} deletePage={this.deletePage} data={page} reorderPages={this.reorderPages} />);
		});
		// return pages;
		return pages;
	}

	render() {
		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-12">
						<div className="panel panel-default">
							<div className="panel-body">
								<div className="col-md-12">
									<button className="btn btn-primary" style="width: 100%" onClick={this.addPage}>
										Add a Page
									</button>
								</div>
							</div>
						</div>
					</div>
					<div className="col-md-12" id="pages">
						{this.renderPages()}
					</div>
				</div>
			</div>
		);
	}
}

export default Content;
