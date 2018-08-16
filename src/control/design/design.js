import React from 'react';
import debounce from 'lodash.debounce';

class Design extends React.Component {
	constructor(props) {
		super(props);
		this.debounceSync = debounce(this.syncState, 1000);
		this.state = {
			settings: {
				options: {
					renderTitlebar: true,
					navPosition: 'top',
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
		this.debounceSync();
		this.state.settings.options.navPosition === 'bottom' ? (document.getElementById('nav-pos-bottom').checked = true) : (document.getElementById('nav-pos-bottom').checked = false);
		this.state.settings.options.navPosition === 'top' ? (document.getElementById('nav-pos-top').checked = true) : (document.getElementById('nav-pos-top').checked = false);
		this.state.settings.options.renderTitlebar === true ? (document.getElementById('titlebar').checked = true) : (document.getElementById('titlebar').checked = false);
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
	render() {
		return (
			<div>
				<div className="container">
					<div className="row">
						<div className="col-md-12">
							<h4>Page Navigation Position</h4>
							<div className="btn-group">
								<form>
									<label htmlFor="nav-pos">Bottom</label>
									<input
										id="nav-pos-bottom"
										type="checkbox"
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
									/>
								</form>
								<form>
									<label htmlFor="nav-pos">Top</label>
									<input
										id="nav-pos-top"
										type="checkbox"
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
									/>
								</form>
								<br />
								<form>
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
								</form>
								<form>
									<input type='number' value={this.state.settings.options.layout} onChange={e => {
										let settings = this.state.settings;
										settings.options.layout = e.target.value;
										this.setState({ settings });
									}}>
									</input>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Design;
