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
		this.debounceSync = debounce(this.syncState, 1000);
		this.editor = {};
		this.state = {
			settings: {
				pages: [],
				options: {
					renderTitlebar: true,
					navPosition: 'top'
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
		let newPage = {
			title: 'New Page',
			id: Date.now(),
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
		};
		let pages = this.state.settings.pages;
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
		buildfire.datastore.get('master', (err, response) => {
			if (err) throw err;
			if (!response.id) {
				buildfire.datastore.insert({ settings: this.state.settings }, 'master', true, (err, status) => {
					if (err) throw err;
				});
				return;
			} else {
				// insert pages into db
				buildfire.datastore.update(response.id, { settings: this.state.settings }, 'master', (err, status) => {
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
			console.log(e.title);
			let target = this.state.settings.pages.filter(page => {
				return page.title === e.title;
			});
			let index = this.state.settings.pages.indexOf(target[0]);
			document.querySelector(`#tab${index}`).click();
		};
		this.editor = new buildfire.components.pluginInstance.sortableList('#pages', [], { confirmDeleteItem: true }, false, false, { itemEditable: true, navigationCallback });

		this.editor.onOrderChange = () => {
			let settings = this.state.settings;
			settings.pages = this.editor.items;
			console.log(settings);
			this.setState({ settings });
		};

		this.editor.onDeleteItem = () => {
			let settings = this.state.settings;
			settings.pages = this.editor.items;
			console.log(settings);
			this.setState({ settings });
		};

		buildfire.datastore.get('master', (err, response) => {
			if (err) throw err;
			// if none are present, insert default data
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
						styleOverrides: [],
						options: {
							showTitleBar: false,
							navPosition: 'top'
						}
					}
				});
			} else {
				// otherwise, if all pages have been removed, insert default data
				if (response.data.settings.pages.length === 0) {
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
							styleOverrides: [],
							options: {
								showTitleBar: false,
								navPosition: 'top'
							}
						}
					});
				} else {
					// update settings
					this.setState({ settings: response.data.settings });
				}
			}
		});
	}
	// EVERY TIME THE STATE CHANGES, SYNC STATE WITH DB
	componentDidUpdate() {
		// DEBOUNCER THAT RUNS THIS.SYNCSTATE
		this.debounceSync();
		// CHANGES THE CHECKBOXES TO MATCH STATE
		this.state.settings.options.navPosition === 'bottom' ? (document.getElementById('nav-pos-bottom').checked = true) : (document.getElementById('nav-pos-bottom').checked = false);
		this.state.settings.options.navPosition === 'top' ? (document.getElementById('nav-pos-top').checked = true) : (document.getElementById('nav-pos-top').checked = false);
		this.state.settings.options.renderTitlebar === true ? (document.getElementById('titlebar').checked = true) : (document.getElementById('titlebar').checked = false);
		if (this.state.settings.pages.length < 1) return;
		this.editor.loadItems(this.state.settings.pages, false);
		document.querySelector('.carousel-items > div').onClick = e => {
			console.log(e);
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
							<div className="panel-heading">
								<h3 className="panel-title">Plugin Configuration</h3>
							</div>
							<div className="panel-body">
								<div className="col-md-12">
									<div className="panel panel-default">
										<button className="btn btn-primary" style="width: 100%" onClick={this.addPage}>
											Add a Page
										</button>
									</div>
								</div>
								<div className="col-md-12">
									<div className="panel panel-default">
										<div className="panel-body">
											<div className="col-md-6">
												<div className="btn-group">
												<form onChange={e=>console.log(e)}>
													<h4>Page Navigation Position</h4>
													<label htmlFor="nav-pos">Bottom &nbsp;</label>
													<input
														id="nav-pos-bottom"
														type="checkbox"
														name='bottom'
														aria-label="..."
														onClick={e => {
															switch (e.target.checked) {
																case true: {
																	let settings = this.state.settings;
																	settings.options.navPosition = 'bottom';
																	this.setState({ settings });
																	break;
																}
																case false: {
																	let settings = this.state.settings;
																	settings.options.navPosition = 'top';
																	this.setState({ settings });
																	break;
																}
																default:
																	return;
															}
														}}
													/>
													<br/>
													<label htmlFor="nav-pos">top &nbsp;</label>
													<input
														id="nav-pos-top"
														type="checkbox"
														name='top'
														aria-label="..."
														onClick={e => {
															switch (e.target.checked) {
																case true: {
																	let settings = this.state.settings;
																	settings.options.navPosition = 'top';
																	this.setState({ settings });
																	break;
																}
																case false: {
																	let settings = this.state.settings;
																	settings.options.navPosition = 'bottom';
																	this.setState({ settings });
																	break;
																}
																default:
																	return;
															}
														}}
													/>
													</form>
													<br/>
													<label htmlFor="titlebar">Display Titlebar &nbsp;</label>
													<input
														id="titlebar"
														type="checkbox"
														aria-label="..."
														onClick={e => {
															switch (e.target.checked) {
																case true: {
																	let settings = this.state.settings;
																	settings.options.renderTitlebar = true;
																	this.setState({ settings });
																	break;
																}
																case false: {
																	let settings = this.state.settings;
																	settings.options.renderTitlebar = false;
																	this.setState({ settings });
																	break;
																}
																default:
																	return;
															}
														}}
													/>
												</div>
											</div>
											<div className="col-md-6" />
										</div>
									</div>
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
