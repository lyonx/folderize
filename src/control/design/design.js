import React from 'react';
import debounce from 'lodash.debounce';

class Design extends React.Component {
	constructor(props) {
		super(props);
		this.debounceSync = debounce(this.syncState, 100);
		this.layouts = ['./layouts/layout0.PNG', './layouts/layout1.PNG', './layouts/layout2.PNG', './layouts/layout3.PNG', './layouts/layout4.PNG', './layouts/layout5.PNG'];
		this.state = {
			settings: {
				options: {
					backgroundImg: '',
					backgroundLrg: '',
					backgroundCSS: '',
					backgroundColor: {},
					bodyFontSize: 24,
					headerFontSize: 36,
					textAlign: 'left',
					renderTitlebar: true,
					navPosition: null,
					colorOverrides: [],
					layout: 0
				}
			}
		};
	}

	// ----------------------- LIFECYCLE METHODS ----------------------- //

	componentDidUpdate() {
		console.warn(this.state);

		this.debounceSync();
	}

	componentDidMount() {
		console.warn(this.state);

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

	// ------------------------- DATA HANDLING ------------------------- //

	changeBackground(size, remove) {
		let settings = this.state.settings;
		if (remove) {
			switch (size) {
				case 'small':
					settings.options.backgroundImg = '';
					this.setState({ settings });
					break;
				case 'large':
					settings.options.backgroundLrg = '';
					this.setState({ settings });
					break;
				default:
					break;
			}
			return;
		}
		buildfire.imageLib.showDialog({ multiSelection: false }, (err, res) => {
			if (err) throw err;
			if (!res.selectedFiles[0]) return;
			switch (size) {
				case 'small':
					settings.options.backgroundImg = res.selectedFiles[0];
					this.setState({ settings });
					break;
				case 'large':
					settings.options.backgroundLrg = res.selectedFiles[0];
					this.setState({ settings });
					break;
				default:
					break;
			}
		});
	}

	colorPicker(remove) {
		let settings = this.state.settings;
		let bgCSS;
		if (remove) {
			settings.options.backgroundColor = {};
			settings.options.backgroundCSS = '';
			this.setState({ settings });
			return;
		}
		let onChange = (err, res) => {
			if (err) throw err;
			console.log(res);
			
			switch (res.colorType) {
				case 'solid': {
					bgCSS = res.solid.backgroundCSS;
					buildfire.messaging.sendMessageToWidget({ color: bgCSS});
					break;
				}
				case 'gradient': {
					bgCSS = res.gradient.backgroundCSS;
					buildfire.messaging.sendMessageToWidget({ color: bgCSS});
					break;
				}
			}
			
		};
		buildfire.colorLib.showDialog(this.state.settings.options.backgroundColor, {backdrop: false}, onChange, (err, res) => {
			if (err) throw err;
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
			settings.options.backgroundColor = res;
			settings.options.backgroundCSS = bgCSS;
			this.setState({ settings });
		});
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

	// --------------------------- RENDERING --------------------------- //

	renderLayouts() {
		let layouts = [];
		this.layouts.forEach((layout, index) => {
			layouts.push(
				<a
					className="layouticon border-radius-three default-background-hover text-center ng-scope"
					onClick={() => {
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
						{/* NAV POSITION> */}
						<div className="item row margin-bottom-twenty clearfix">
							<div className="labels col-md-3 padding-right-zero pull-left">
								<span title="Change the positioning of the navbar.">Page Navigation Position</span>
							</div>
							{/* <div className="btn-group"> */}
							<div className="main col-md-9 pull-right">
								<div title="Sets the navbar to appear at the bottom of the screen." className="radio radio-primary radio-inline">
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

								<div title="Sets the navbar to appear at the top of the screen." className="radio radio-primary radio-inline">
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
						</div>
						<br />
						{/* TITLEBAR DISPLAY */}
						<div className="item row margin-bottom-twenty clearfix">
							<div className="labels col-md-3 padding-right-zero pull-left">
								<span title="Toggle the display of the Buildfire titlebar.">Display Titlebar</span>
							</div>
							<div className="main col-md-9 pull-right">
								<div title='Forces the Buildfire titlebar to show.' className="radio radio-primary radio-inline">
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
								<div title='Forces the Buildfire titlebar to hide.' className="radio radio-primary radio-inline">
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
						</div>
						<hr />
						{/* LAYOUTS */}
						<div className="item row margin-bottom-twenty clearfix">
							<div className="labels col-md-3 padding-right-zero pull-left">
								<span title="Change the appearance of all Action Items">Layout Style</span>
							</div>
							<div className="main col-md-9 pull-right">
								<div className="screens clearfix">
									<div className="screen layouticon pull-left">
										<a className="border-radius-three default-background-hover text-center">
											<img id="current-layout" src={this.layouts[this.state.settings.options.layout]} />
										</a>
									</div>
									<div className="screen layoutgrid pull-right margin-left-zero border-grey border-radius-three">{this.renderLayouts()}</div>
								</div>
							</div>
						</div>
						<hr />
						{/* BACKGROUND IMAGE */}
						<div className="item clearfix row padding-bottom-twenty">
							<div className="labels col-md-3 padding-right-zero pull-left">
								<span title="Set a background behind all pages. Page backgrounds can be individually set in their Options.">Background Image</span>
							</div>
							<div className="main col-md-9 pull-right">
								<div className="screens clearfix">
									<div className="devices-screen mobile-device text-center pull-left">
										<a onClick={() => this.changeBackground('small', false)}>
											<span className="add-icon">+</span>
											<img className="bg-sm" src={buildfire.imageLib.cropImage(this.state.settings.options.backgroundImg, { width: 66, height: 116 })} style={this.state.settings.options.backgroundImg ? false : 'display: none'} />
										</a>
										<label className="secondary">750x1334</label>
										<span className="icon btn-icon btn-delete-bg btn-delete-icon btn-danger transition-third" style={this.state.settings.options.backgroundImg ? false : 'display: none'} onClick={() => this.changeBackground('small', true)} />
									</div>
									<div className="devices-screen ipad-device pull-left text-center">
										<a onClick={() => this.changeBackground('large', false)}>
											<span className="add-icon">+</span>

											<img className="bg-lrg" src={buildfire.imageLib.cropImage(this.state.settings.options.backgroundLrg, { width: 135, height: 190 })} style={this.state.settings.options.backgroundLrg ? false : 'display: none'} />
										</a>
										<label className="secondary">1536x2048</label>
										<span className="icon btn-icon btn-delete-bg btn-delete-icon btn-danger transition-third" style={this.state.settings.options.backgroundLrg ? false : 'display: none'} onClick={() => this.changeBackground('large', true)} />
									</div>
								</div>
							</div>
						</div>
						<hr />
						{/* COLOR PICKER */}
						<div className="item row margin-bottom-twenty clearfix">
							<div className="labels col-md-3 padding-right-zero pull-left">
								<span title="Set a background overlay behind all pages. Page background overlays can be individually set in their Options.">Background Overlay</span>
							</div>
							<div className="main col-md-9 pull-right">
								<div className="tab">
									<button
									title='Click to change the overlay color.'
										className="thumbnail"
										id="bg-cover"
										style={`${this.state.settings.options.backgroundCSS}`}
										onClick={() => {
											this.colorPicker(false);
										}}>
										<h5>{this.state.settings.options.backgroundColor.colorType ? this.state.settings.options.backgroundColor.colorType : 'Add Overlay Color'}</h5>
									</button>
									<button
									title='Click to remove overlay color.'
										className="btn btn-danger"
										onClick={() => {
											this.colorPicker(true);
										}}>
										Remove
									</button>
								</div>
							</div>
						</div>
						<hr />
						{/* TEXT ALIGN */}
						<div className="item row margin-bottom-twenty clearfix">
							<div className="labels col-md-3 padding-right-zero pull-left">
								<span title="Set text allignment for all page text.">Text Alignment</span>
							</div>
							<div className="main col-md-9 pull-right">
								<div title='Align all page text right.' className="radio radio-primary radio-inline">
									<input
										className="input-radio"
										id="align-left"
										type="radio"
										aria-label="..."
										onClick={e => {
											switch (e.target.checked) {
												case true: {
													let settings = this.state.settings;
													settings.options.textAlign = 'left';
													this.setState({ settings });
													break;
												}
												case false: {
													let settings = this.state.settings;
													settings.options.textAlign = 'center';
													this.setState({ settings });
													break;
												}
												default:
													return;
											}
										}}
										checked={this.state.settings.options.textAlign === 'left' ? true : false}
									/>
									<label htmlFor="align-left">Left</label>
								</div>
								<div title='Align all page text center.' className="radio radio-primary radio-inline">
									<input
										className="input-radio"
										id="align-center"
										type="radio"
										aria-label="..."
										onClick={e => {
											switch (e.target.checked) {
												case true: {
													let settings = this.state.settings;
													settings.options.textAlign = 'center';
													this.setState({ settings });
													break;
												}
												case false: {
													let settings = this.state.settings;
													settings.options.textAlign = 'left';
													this.setState({ settings });
													break;
												}
												default:
													return;
											}
										}}
										checked={this.state.settings.options.textAlign === 'center' ? true : false}
									/>
									<label htmlFor="align-center">Center</label>
								</div>
							</div>
						</div>
						<hr />
						{/* FONT SIZE */}
						<div className="item row margin-bottom-twenty clearfix">
							<div className="labels col-md-3 padding-right-zero pull-left">
								<span title="Set a font size for all page text.">Font Size</span>
							</div>
							<div className="main col-md-9 pull-right">
								<label htmlFor='header-font-size'>Headers: </label>
								<input title='Change the header font size. You can use keyboard arrows.' type='number' name='header-font-size' value={this.state.settings.options.headerFontSize} onChange={e => {
									let settings = this.state.settings;
									settings.options.headerFontSize = parseInt(e.target.value);
									this.setState({ settings });
								}}/>
								{'       '}
								<label htmlFor='body-font-size'>Body: </label>
								<input title='Change the body font size. You can use keyboard arrows.' type='number' name='body-font-size' value={this.state.settings.options.bodyFontSize} onChange={e => {
									let settings = this.state.settings;
									settings.options.bodyFontSize = parseInt(e.target.value);
									this.setState({ settings });
								}}/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Design;
