import React, { Component } from 'react';
import Page from './Components/Page';
import debounce from 'lodash.debounce';

let buildfire = window.buildfire;
let tinymce = window.tinymce;
let db = buildfire.datastore;

class Content extends Component {
	constructor(props) {
		super(props);
		this.addPage = this.addPage.bind(this);
		this.deletePage = this.deletePage.bind(this);
		this.addImg = this.addImg.bind(this);
		this.updatePage = this.updatePage.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.renderPages = this.renderPages.bind(this);
		this.reorderPages = this.reorderPages.bind(this);
		this.debounceSync = debounce(this.syncState, 1000);
		this.state = {
			layout: 1,
			settings: {
				pages: [],
				styleOverrides: [],
				options: {
					renderTitlebar: true
				}
			}
		};
	}

	addStyleOverride(target, attr, value) {
		console.log(target, attr, value);
		let settings = this.state.settings;
		let styleOverrides = this.state.settings.styleOverrides;
		let currentStyle = [];
		let index = 0;
		let i = 0;

		let style = styleOverrides.filter(style => {
			index = styleOverrides.indexOf(style);
			return style.target === target;
		});

		if (style[0]) {
			currentStyle = style[0].data.styles.filter(e => {
				i = style[0].data.styles.indexOf(e);
				return e.attr === attr;
			});
			currentStyle[0].value = value;
			style[0].data.styles[i] = currentStyle;
			styleOverrides[index] = style;
		} else {
			style = {
				target,
				data: {
					attr,
					value
				}
			};
			styleOverrides.push(style);
		}

		settings.styleOverrides = styleOverrides;

		this.setState({ settings });
	}

	fetch() {
		// Control looks in db for any pages
		db.get('master', (err, response) => {
			if (err) throw err;
			// if none are present, insert a default page
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
						styleOverrides: []
					}
				});
			} else {
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
					this.setState({ settings: response.data.settings });
				}
			}
		});
	}

	syncState() {
		// when a state change is detected,
		db.get('master', (err, response) => {
			if (err) throw err;
			if (!response.id) {
				db.insert({ settings: this.state.settings }, 'master', true, (err, status) => {
					if (err) throw err;
				});
				return;
			} else {
				// insert pages into db
				db.update(response.id, { settings: this.state.settings }, 'master', (err, status) => {
					if (err) {
						throw err;
					}
					console.log(status);
				});
			}
		});
		// db.get('settings', (err, response) => {
		// 	if (err) throw err;
		// 	if (!response.id) {
		// 		db.insert({ pages: this.state.settings }, 'settings', true, (err, status) => {
		// 			if (err) throw err;
		// 		});
		// 		return;
		// 	} else {
		// 		// insert pages into db
		// 		db.update(response.id, { settings: this.state.settings }, 'settings', (err, status) => {
		// 			if (err) {
		// 				throw err;
		// 			}
		// 			console.log(status);
		// 		});
		// 	}
		// });
	}

	handleChange(event) {
		const target = event.target;
		const name = target.name;
		this.setState({ [name]: event.target.value });
	}

	renderPages() {
		let pages = [];
		this.state.settings.pages.map(page => {
			pages.push(<Page index={this.state.settings.pages.indexOf(page)} updatePage={this.updatePage} deletePage={this.deletePage} data={page} reorderPages={this.reorderPages} />);
		});
		return pages;
	}

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

	addImg() {
		buildfire.imageLib.showDialog({}, (err, result) => {
			if (err) throw err;
			this.setState({ image: result.selectedFiles[0] });
		});
	}

	deletePage(index) {
		let pages = this.state.settings.pages;
		pages.splice(index, 1);
		this.setState({ pages: pages });
	}

	updatePage(index, page) {
		let pages = this.state.settings.pages;
		pages[index] = page;
		this.setState({ pages: pages });
	}

	componentDidMount() {
		// Control looks in db for any pages
		this.fetch();
		// this.initSortable();
		// this.mceInit();
	}

	componentDidUpdate() {
		// this.syncState();
		this.state.settings.options.navPosition === 'bottom' ? document.getElementById('nav-pos').checked = true : document.getElementById('nav-pos').checked = false;
		this.state.settings.options.renderTitlebar === true ? document.getElementById('titlebar').checked = true : document.getElementById('titlebar').checked = false;
		console.warn(this.state);
		this.debounceSync();
	}

	render() {
		console.count('render');
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
													<label htmlFor="nav-pos">Page Navigation Position Bottom &nbsp;</label>
														<input
															id="nav-pos"
															type="checkbox"
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
					<div className="col-md-12" id="nodeDiv">
						{this.renderPages()}
					</div>
				</div>
			</div>
		);
	}
}

export default Content;
