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
		this.debounceSync = debounce(this.syncState, 250);
		this.editor = {};
		this.state = {
			tutorials: false,
			settings: {
				pages: [],
				options: {
					renderTitlebar: true,
					navPosition: 'top',
					colorOverrides: [],
					navStyle: 'content'
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
		if (this.state.settings.pages.length === 0) {
			if (localStorage.getItem('tutorial') === 'true') {
				localStorage.setItem('tutorial', false);
				// let tutorials = this.state.tutorials;
				// tutorials = false;
				// this.setState({ tutorials });
				// return;
			}

			localStorage.setItem('tutorial', true);
			// let tutorials = this.state.tutorials;
			// tutorials = true;
			// this.setState({ tutorials });
		} else {
			localStorage.setItem('tutorial', false);
			// let tutorials = this.state.tutorials;
			// tutorials = false;
			// this.setState({ tutorials });
		}

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
		this.setState({ settings });
		// if (pages.length > 1) {
		setTimeout(() => {
			document.querySelector(`#tab${settings.pages.length - 1}`).click();
		}, 250);
		setTimeout(() => {
			buildfire.messaging.sendMessageToWidget({ index: settings.pages.length - 1 });
		}, 750);
	}
	// USED BY THE PAGES TO DELETE THEMSELVES
	deletePage(index) {
		let settings = this.state.settings;
		// let pages = this.state.settings.pages;
		settings.pages.splice(index, 1);

		this.setState({ settings });
	}
	// USED BY THE PAGES TO UPDATE THEIR DATA IN CONTENT STATE
	updatePage(index, page) {
		let settings = this.state.settings;
		// let pages = this.state.settings.pages;
		settings.pages[index] = page;
		this.setState({ settings });
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
			let target = this.state.settings.pages.filter(page => {
				return page.instanceId === e.instanceId;
			});
			let index = this.state.settings.pages.indexOf(target[0]);
			buildfire.messaging.sendMessageToWidget({ index });
			document.querySelector(`#tab${index}`).click();
		};
		this.editor = new buildfire.components.pluginInstance.sortableList('#pages', [], { confirmDeleteItem: true }, false, false, { itemEditable: true, navigationCallback });

		this.editor.onOrderChange = () => {
			let settings = this.state.settings;
			settings.pages = this.editor.items;
			//
			this.setState({ settings });
		};

		this.editor.onAddItems = e => {};

		this.editor.onDeleteItem = () => {
			let settings = this.state.settings;
			settings.pages = this.editor.items;
			//
			this.setState({ settings });
		};

		// 		(() => {
		// 			buildfire.datastore.get('data', (err, response) => {
		// 				if (err) throw err;
		// 				//

		// 					// insert pages into db
		// 					buildfire.datastore.update(response.id, { settings: this.state.settings }, 'data', (err, status) => {
		// 						if (err) {
		// 							throw err;
		// 						}
		// 					});

		// 			});
		// 		})();

		// (() => {
		// 	buildfire.datastore.search({ limit: 20 }, 'data', (err, response) => {
		// 		if (err) throw err;
		// 		//
		// 	});
		// })();
		buildfire.datastore.get('data', (err, response) => {
			if (err) throw err;
			// if none are present, insert default data
			//

			if (!response.id) {
				this.setState({
					settings: {
						pages: [
							{
								title: 'new page',
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
					// setTimeout(() => {
					// 	document.querySelector(`#tab0`).click();
					// }, 250);
				} else {
					// update settings
					this.setState({ settings: response.data.settings });
				}
			}
		});
		// let tutorials = localStorage.getItem('tutorial');
		// if (tutorials === 'true') {
		// let tutorials = this.state.tutorials;
		// tutorials = true;
		// this.setState({ tutorials });
		// } else {
		// let tutorials = this.state.tutorials;
		// tutorials = false;
		// this.setState({ tutorials });
		// }
	}
	// EVERY TIME THE STATE CHANGES, SYNC STATE WITH DB
	componentDidUpdate() {
		// DEBOUNCER THAT RUNS THIS.SYNCSTATE

		// console.log(this.state);
		this.debounceSync();
		this.editor.loadItems(this.state.settings.pages, false, false);
	}

	// --------------------------- RENDERING --------------------------- //

	// LOOPS THROUGH AND RETURNS PAGES
	renderPages() {
		// if (this.state.settings.pages.length < 1) return;
		let tutorials = JSON.parse(localStorage.getItem('tutorial'));
		let pages = [];
		this.state.settings.pages.map(page => {
			pages.push(<Page index={this.state.settings.pages.indexOf(page)} tutorials={tutorials} updatePage={this.updatePage} deletePage={this.deletePage} data={page} reorderPages={this.reorderPages} />);
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
					{/* <h4 className="text-center">Pages</h4> */}
						{this.renderPages()}
					</div>
				</div>
			</div>
		);
	}
}

export default Content;
