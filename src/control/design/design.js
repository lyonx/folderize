import React from 'react';
import debounce from 'lodash.debounce';

class Design extends React.Component {
	constructor(props) {
		super(props);
		this.debounceSync = debounce(this.syncState, 100);
		this.layouts = ['./layouts/layout1.PNG', './layouts/layout2.PNG', './layouts/layout2.PNG', './layouts/layout4.PNG'];
		this.state = {
			settings: {
				options: {
					renderTitlebar: true,
					navPosition: null,
					colorOverrides: [],
					layout: 0
				}
			}
		};
	}

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

	componentDidUpdate() {
		console.log(this.state);

		this.debounceSync();
		// this.state.settings.options.navPosition === 'bottom' ? (document.getElementById('nav-pos-bottom').checked = true) : (document.getElementById('nav-pos-bottom').checked = false);
		// this.state.settings.options.navPosition === 'top' ? (document.getElementById('nav-pos-top').checked = true) : (document.getElementById('nav-pos-top').checked = false);
		// this.state.settings.options.renderTitlebar === true ? (document.getElementById('titlebar').checked = true) : (document.getElementById('titlebar').checked = false);
	}

	componentDidMount() {
		buildfire.datastore.get('data', (err, response) => {
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

	renderLayouts() {
		let layouts = [];
		this.layouts.forEach((layout, index) => {
			layouts.push(
				<a className="layouticon border-radius-three default-background-hover text-center ng-scope" onClick={() => {
					let settings = this.state.settings;
					settings.options.layout = index;
					this.setState({ settings });
				}}>
					<img src={this.layouts[index]} />
				</a>
			);
		});
		return layouts;
	}

	render() {
		return (
			<div>
				<div className="container">
					<div className="row">
						{/* <div className="col-md-12"> */}
						<div className="item row margin-bottom-twenty clearfix">
							<div className="labels col-md-3 padding-right-zero pull-left">
								<span>Page Navigation Position</span>
							</div>
							{/* <div className="btn-group"> */}
							<div className="radio radio-primary radio-inline">
								<input
									className="input-radio"
									id="nav-pos-bottom"
									type="radio"
									name="bottom"
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
									checked={this.state.settings.options.navPosition === 'bottom' ? true : false}
								/>
								<label htmlFor="nav-pos-bottom">Bottom</label>
							</div>

							<div className="radio radio-primary radio-inline">
								<input
									className="input-radio"
									id="nav-pos-top"
									type="radio"
									name="top"
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
									checked={this.state.settings.options.navPosition === 'top' ? true : false}
								/>
								<label htmlFor="nav-pos-top">Top</label>
							</div>
						</div>
						<br />
						<div className="item row margin-bottom-twenty clearfix">
							<div className="labels col-md-3 padding-right-zero pull-left">
								<span>Display Titlebar</span>
							</div>
							<div className="radio radio-primary radio-inline">
								<input
									className="input-radio"
									id="titlebar-true"
									type="radio"
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
									checked={this.state.settings.options.renderTitlebar ? true : false}
								/>
								<label htmlFor="titlebar-true">True</label>
							</div>
							<div className="radio radio-primary radio-inline">
								<input
									className="input-radio"
									id="titlebar-false"
									type="radio"
									aria-label="..."
									onClick={e => {
										switch (e.target.checked) {
											case true: {
												let settings = this.state.settings;
												settings.options.renderTitlebar = false;
												this.setState({ settings });
												break;
											}
											case false: {
												let settings = this.state.settings;
												settings.options.renderTitlebar = true;
												this.setState({ settings });
												break;
											}
											default:
												return;
										}
									}}
									checked={this.state.settings.options.renderTitlebar ? false : true}
								/>
								<label htmlFor="titlebar-false">False</label>
							</div>
						</div>
						<div className="item row margin-bottom-twenty clearfix">
							<div className="labels col-md-3 padding-right-zero pull-left">
								<span>Layout Style</span>
							</div>
							<div className="main col-md-9 pull-right">
								<div className="screens clearfix">
									<div className="screen layouticon pull-left">
										<a className="border-radius-three default-background-hover text-center">
											<img id="current-layout" src={this.layouts[this.state.settings.options.layout]}/>
										</a>
									</div>
									<div className="screen layoutgrid pull-right margin-left-zero border-grey border-radius-three">
										{this.renderLayouts()}
									</div>
								</div>
							</div>
						</div>
						{/* </div> */}
					</div>
				</div>
			</div>
		);
	}
}

export default Design;
