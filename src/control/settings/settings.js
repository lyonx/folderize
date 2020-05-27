import React, { Component } from 'react';
import debounce from 'lodash.debounce';

class Settings extends Component {
	constructor(props) {
		super(props);
		this.debounceSync = debounce(this.syncState, 100);
		this.state = {
			settings: {
				pages: [],
				options: {
					rememberPageIndex: true,
					backgroundImg: '',
					backgroundLrg: '',
					backgroundCSS: '',
					backgroundColor: {},
					bodyFontSize: 24,
					headerFontSize: 36,
					textAlign: 'left',
					renderTitlebar: true,
					navPosition: 'top',
					navShadow: false,
					layout: 0
				}
			}
		};
	}

	// ----------------------- LIFECYCLE METHODS ----------------------- //

	componentDidMount() {
		buildfire.datastore.get('data', (err, response) => {
			if (err) throw err;
			// if none are present, insert default data
			if (!response.id) return;
			// otherwise, if all pages have been removed, insert default data
			// if (response.data.settings.pages.length === 0) return;
			// update settings
			this.setState({ settings: response.data.settings });
		});
	}

	componentDidUpdate() {
		this.debounceSync();
	}

	// ------------------------- DATA HANDLING ------------------------- //

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

	render() {
		return (
			<div>
				{/* REMEMBER PAGE */}
				<div className="item row margin-bottom-twenty clearfix">
					<div className="labels col-md-3 padding-right-zero pull-left">
						<span title="Automatically brings the user to the last page they were on.">Remember Page</span>
					</div>
					<div className="main col-md-9 pull-right">
						<div title="Enables Page Memory" className="radio radio-primary radio-inline">
							<input
								className="input-radio"
								id="page-memory-true"
								type="radio"
								aria-label="..."
								onClick={e => {
									switch (e.target.checked) {
										case true: {
											let settings = this.state.settings;
											settings.options.rememberPageIndex = true;
											this.setState({ settings });
											break;
										}
										case false: {
											let settings = this.state.settings;
											settings.options.rememberPageIndex = false;
											this.setState({ settings });
											break;
										}
										default:
											return;
									}
								}}
								checked={this.state.settings.options.rememberPageIndex ? true : false}
							/>
							<label htmlFor="page-memory-true">True</label>
						</div>
						<div title="Disables Page Memory." className="radio radio-primary radio-inline">
							<input
								className="input-radio"
								id="page-memory-false"
								type="radio"
								aria-label="..."
								onClick={e => {
									switch (e.target.checked) {
										case true: {
											let settings = this.state.settings;
											settings.options.rememberPageIndex = false;
											this.setState({ settings });
											break;
										}
										case false: {
											let settings = this.state.settings;
											settings.options.rememberPageIndex = true;
											this.setState({ settings });
											break;
										}
										default:
											return;
									}
								}}
								checked={this.state.settings.options.rememberPageIndex ? false : true}
							/>
							<label htmlFor="page-memory-false">False</label>
						</div>
					</div>
				</div>
				{/* <br /> */}
				{/* TITLEBAR DISPLAY */}
				<div className="item row margin-bottom-twenty clearfix">
					<div className="labels col-md-3 padding-right-zero pull-left">
						<span title="Toggle the display of the Buildfire titlebar.">Display Titlebar</span>
					</div>
					<div className="main col-md-9 pull-right">
						<div title="Forces the Buildfire titlebar to show." className="radio radio-primary radio-inline">
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
						<div title="Forces the Buildfire titlebar to hide." className="radio radio-primary radio-inline">
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
			</div>
		);
	}
}

export default Settings;
