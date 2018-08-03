import React, { Component } from 'react';
let db = buildfire.datastore;

class Page extends Component {
	constructor(props) {
		super(props);
		this.updatePage = props.updatePage;
		this.deletePage = props.deletePage;
		this.reorderPages = props.reorderPages;
		this.key = props.key;
		// this.modal = document.createElement("div");
		this.update = this.update.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.delete = this.delete.bind(this);
		this.state = {
			title: props.data.title,
			nodes: [],
			show: false,
			backgroundColor: this.props.backgroundColor,
			backgroundImg: this.props.backgroundImg,
			iconUrl: this.props.iconUrl
		};
	}

	initSortable() {
		let selector = `#plugins${this.props.index}`;
		let plugins = new buildfire.components.pluginInstance.sortableList(
			selector,
			[],
			{
				showIcon: true,
				confirmDeleteItem: false
			},
			undefined,
			undefined,
			{
				itemEditable: true,
				navigationCallback: () => console.log('nav cb')
			}
		);
		let pluginNodes = this.state.nodes.filter(node => {
			return node.type === 'plugin';
		});
		// plugins.loadItems()

		plugins.onAddItems = () => {
			let items = plugins.items;
			// this.getPluginInfo(items);
			let nodes = this.state.nodes;
			buildfire.pluginInstance.get(items[items.length - 1].instanceId, (err, inst) => {
				if (err) throw err;
				nodes.push({
					type: 'plugin',
					data: inst
				});
				this.setState({
					nodes: nodes
				});
				this.toggleModal(this.props.index, 'plugins', 'hide');
				this.update();
			});
		};
		plugins.onDeleteItem = () => {
			this.setState({
				plugins: plugins.items
			});
			this.update();
		};
		plugins.onOrderChange = () => {
			this.setState({
				plugins: plugins.items
			});
			this.update();
		};
	}

	initActionItems() {
		var editor = new buildfire.components.actionItems.sortableList(`#actions${this.props.index}`);

		editor.onAddItems = () => {
			let items = editor.items;
			let nodes = this.state.nodes;
			nodes.push({
				type: 'action',
				data: editor.items[editor.items.length - 1]
			});
			this.setState({
				nodes: nodes
			});
			this.toggleModal(this.props.index, 'actions', 'hide');
			this.update();
		};
	}

	delete() {
		this.deletePage(this.props.index);
	}

	update() {
		this.updatePage(this.props.index, {
			title: this.state.title,
			id: this.props.data.id,
			images: this.state.images,
			nodes: this.state.nodes,
			show: this.state.show,
			customizations: this.state.customizations,
			backgroundColor: this.state.backgroundColor,
			backgroundImg: this.state.backgroundImg,
			iconUrl: this.state.iconUrl
		});
	}

	handleNodeChange(event, index, attr) {
		let nodes = this.props.data.nodes;
		let node = this.props.data.nodes[index];
		switch (attr) {
			case 'text': {
				node.data.text = event.target.value;
				nodes[index] = node;
				this.setState({
					nodes
				});
				this.update();
				break;
			}
			case 'src': {
				switch (node.type) {
					case 'plugin': {
						node.data.iconUrl = event;
						break;
					}
					case 'image': {
						node.data.src = event;
						break;
					}
					case 'hero': {
						node.data.src = event;
						break;
					}
					case 'action': {
						node.data.iconUrl = event;
						break;
					}
					default:
						return;
				}
				nodes[index] = node;
				this.setState({
					nodes
				});
				this.update();
				break;
			}
			case 'delete': {
				nodes.splice(index, 1);
				this.setState({
					nodes
				});
				this.update();
				break;
			}
			case 'plugin': {
				node.data.title = event.target.value;
				nodes[index] = node;
				this.setState({
					nodes
				});
				this.update();
				break;
			}
			case 'action': {
				node.data.title = event.target.value;
				nodes[index] = node;
				this.setState({
					nodes
				});
				this.update();
				break;
			}
			case 'icon': {
				node.data.iconUrl = event.target.value;
				nodes[index] = node;
				this.setState({
					nodes
				});
				this.update();
				break;
			}
			case 'hero-header': {
				node.data.header = event.target.value;
				nodes[index] = node;
				this.setState({
					nodes
				});
				this.update();
				break;
			}
			case 'hero-subtext': {
				node.data.subtext = event.target.value;
				nodes[index] = node;
				this.setState({
					nodes
				});
				this.update();
				break;
			}
			case 'hero-button': {
				console.log(event.target.checked);
				node.data.showButton = event.target.value;
				nodes[index] = node;
				this.setState({
					nodes
				});
				this.update();
				break;
			}
			default:
				return;
		}
	}

	renderNodes() {
		let nodes = [];
		this.props.data.nodes.forEach(node => {
			if (!node) return;
			let index = this.props.data.nodes.indexOf(node);
			switch (node.type) {
				case 'header': {
					nodes.push(
						<div className="panel panel-default">
							<div className="panel-heading tab">
								<h3 className="panel-title tab-title">Header</h3>
								<div className="toggle-group">
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 1)}>
										<span className="glyphicon glyphicon-chevron-up" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 0)}>
										<span className="glyphicon glyphicon-chevron-down" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} page={`${this.props.index}`} onClick={e => this.toggle(e, 'node')}>
										{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
									</button>
								</div>
							</div>
							<div className="panel-body panel-hide" data-toggle="hide" id={`page${this.props.index}nodepanel${index}`}>
								<div className="input-group">
									<input type="text" className="form-control" name="heading" aria-describedby="sizing-addon2" value={node.data.text} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'text')} />
								</div>
								<div className="tab">
									<button className="btn btn-danger tab-toggle" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete')}>
										Remove
									</button>
								</div>
							</div>
						</div>
					);
					break;
				}
				case 'desc': {
					nodes.push(
						<div className="panel panel-default">
							<div className="panel-heading tab">
								<h3 className="panel-title tab-title">Description</h3>
								<div className="toggle-group">
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 1)}>
										<span className="glyphicon glyphicon-chevron-up" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 0)}>
										<span className="glyphicon glyphicon-chevron-down" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" id={`node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
										{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
									</button>
								</div>
							</div>
							<div className="panel-body panel-hide" data-toggle="hide" id={`page${this.props.index}nodepanel${index}`}>
								<div className="input-group">
									<textarea
										type="text"
										// className="form-control"
										style="width: 100%; height: 100px"
										name="desc"
										aria-describedby="sizing-addon2"
										value={node.data.text}
										onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'text')}
									/>
								</div>
								<div className="tab">
									<button className="btn btn-danger tab-toggle" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete')}>
										Remove
									</button>
								</div>
							</div>
						</div>
					);
					break;
				}
				case 'image': {
					nodes.push(
						<div className="panel panel-default">
							<div className="panel-heading tab">
								<h3 className="panel-title tab-title">Image</h3>
								<div className="toggle-group">
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 1)}>
										<span className="glyphicon glyphicon-chevron-up" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 0)}>
										<span className="glyphicon glyphicon-chevron-down" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" id={`node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
										{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
									</button>
								</div>
							</div>
							<div className="panel-body panel-hide" data-toggle="hide" id={`page${this.props.index}nodepanel${index}`}>
								<div className="tab">
									<button className="btn btn-success tab-toggle" onClick={() => this.addImg('node', this.props.data.nodes.indexOf(node))}>
										Change Image
									</button>
									<button className="btn btn-danger" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete')}>
										X
									</button>
								</div>
							</div>
						</div>
					);
					break;
				}
				case 'plugin': {
					if (!node.data) return;
					nodes.push(
						<div className="panel panel-default">
							<div className="panel-heading tab">
								<h3 className="panel-title tab-title">
									{node.data._buildfire.pluginType.result[0].name} ({node.data.title})
								</h3>
								<div className="toggle-group">
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 1)}>
										<span className="glyphicon glyphicon-chevron-up" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 0)}>
										<span className="glyphicon glyphicon-chevron-down" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" id={`node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
										{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
									</button>
								</div>
							</div>
							<div className="panel-body panel-hide" id={`page${this.props.index}nodepanel${index}`} data-toggle="hide">
								<div className="plugin">
									<div className="plugin-thumbnail" style={`background: url("${node.data.iconUrl}")`} alt="..." onClick={e => this.addImg(null, this.props.data.nodes.indexOf(node))} />
									{/* <h3 className="plugin-title">{node.data.title}</h3> */}
									<div className="input-group tab-toggle" style="margin-left:15px;">
										<input type="text" className="plugin-title form-control" name="plugin" aria-describedby="sizing-addon2" value={node.data.title} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'plugin')} />
									</div>
								</div>
								<hr />
								<div className="tab">
									<button className="btn btn-danger tab-toggle" onClick={e => this.handleNodeChange(e, index, 'delete')}>
										Remove
									</button>
								</div>
							</div>
						</div>
					);
					break;
				}
				case 'action': {
					if (!node.data) return;
					nodes.push(
						<div className="panel panel-default">
							<div className="panel-heading tab">
								<h3 className="panel-title tab-title">Action</h3>
								<div className="toggle-group">
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 1)}>
										<span className="glyphicon glyphicon-chevron-up" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 0)}>
										<span className="glyphicon glyphicon-chevron-down" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" id={`node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
										{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
									</button>
								</div>
							</div>
							<div className="panel-body panel-hide" id={`page${this.props.index}nodepanel${index}`} data-toggle="hide">
								<div className="action">
									<div className="action-thumbnail" style={`background: url("${node.data.iconUrl}")`} alt="..." onClick={e => this.addImg(null, this.props.data.nodes.indexOf(node))} />
									<h3 className="action-title">{node.data.title}</h3>
								</div>
								<hr />
								<div className="tab">
									<button
										className="btn btn-success tab-toggle"
										onClick={e => {
											console.log(node);
											buildfire.actionItems.showDialog(node.data, {}, (err, res) => {
												if (err) throw err;
												if (!res) return;
												node.data = res;
												this.update();
											});
										}}>
										Edit
									</button>
									<button className="btn btn-danger" onClick={e => this.handleNodeChange(e, index, 'delete')}>
										X
									</button>
								</div>
							</div>
						</div>
					);
					break;
				}
				case 'hero': {
					nodes.push(
						<div className="panel panel-default">
							<div className="panel-heading tab">
								<h3 className="panel-title tab-title">Hero</h3>
								<div className="toggle-group">
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 1)}>
										<span className="glyphicon glyphicon-chevron-up" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 0)}>
										<span className="glyphicon glyphicon-chevron-down" aria-hidden="true" />
									</button>
									<button className="btn btn-deafult tab-toggle" id={`node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
										{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
									</button>
								</div>
							</div>
							<div className="panel-body panel-hide" data-toggle="hide" id={`page${this.props.index}nodepanel${index}`}>
								<div className="input-group">
									<input type="text" className="form-control" name="header" aria-describedby="sizing-addon2" value={node.data.header} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'hero-header')} />
								</div>
								<div className="input-group">
									<input type="text" className="form-control" name="subtext" aria-describedby="sizing-addon2" value={node.data.subtext} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'hero-subtext')} />
								</div>
								{/* <div className="input-group">
									Show Button &nbsp;
									<input type="checkbox" onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'hero-button')} />
								</div> */}
								<div className="tab">
									<button className="btn btn-success tab-toggle" onClick={() => this.addImg('node', this.props.data.nodes.indexOf(node))}>
										Change Image
									</button>
									<button className="btn btn-danger" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete')}>
										X
									</button>
								</div>
							</div>
						</div>
					);
					break;
				}
				default:
					return;
			}
		});
		return nodes;
	}
	// ADDS A NODE OBJECT
	addNode(type) {
		let nodes = this.props.data.nodes;
		switch (type) {
			case 'header': {
				nodes.push({
					type: 'header',
					data: { text: 'new page' }
				});
				this.setState({
					nodes
				});
				break;
			}
			case 'desc': {
				nodes.push({
					type: 'desc',
					data: { text: 'You can edit this description in the control.' }
				});
				this.setState({ nodes });
				break;
			}
			case 'image': {
				nodes.push({
					type: 'image',
					data: { src: 'https://images.unsplash.com/photo-1519636243899-5544aa477f70?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjQ0MDV9&s=6c937b3dbd83210ac77d8c591265cdf8' }
				});
				this.setState({ nodes });
				break;
			}
			case 'hero': {
				nodes.push({
					type: 'hero',
					data: { src: 'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjQ0MDV9&s=289571318ec59acf6bece7e8ece608af', header: 'Hero Header', subtext: 'Hero Subtext', showButton: false, buttonText: "Go!" }
				});
				this.setState({ nodes });
				break;
			}
			default:
				return;
		}
		this.update();
	}

	reorderNodes(index, dir) {
		let nodes = this.props.data.nodes;
		if (dir === 1) {
			let temp = nodes[index - 1];
			if (!temp) return;
			nodes[index - 1] = nodes[index];
			nodes[index] = temp;
			this.setState({ nodes });
			this.update();
		} else {
			let temp = nodes[index + 1];
			if (!temp) return;
			nodes[index + 1] = nodes[index];
			nodes[index] = temp;
			this.setState({ nodes });
			this.update();
		}
	}

	handleChange(event) {
		const target = event.target;
		const name = target.name;
		this.setState({ [name]: event.target.value });
		if (event.type === 'input') {
			this.update();
		}
		// this.update();
	}

	toggle(e, type) {
		let panel;
		switch (type) {
			case 'node': {
				panel = document.getElementById(`page${this.props.index}nodepanel${document.getElementById(e.target.id).getAttribute('index')}`);
				break;
			}
			case 'options': {
				panel = document.getElementById(`page${document.getElementById(e.target.id).getAttribute('index')}options`);
				break;
			}
			default: {
				panel = document.getElementById(`panel${document.getElementById(e.target.id).getAttribute('index')}`);
				break;
			}
		}
		switch (panel.getAttribute('data-toggle')) {
			case 'show':
				panel.classList.remove('panel-show');
				panel.classList.add('panel-hide');
				panel.setAttribute('data-toggle', 'hide');
				this.setState({ show: false });
				break;
			case 'hide':
				panel.classList.remove('panel-hide');
				panel.classList.add('panel-show');
				panel.setAttribute('data-toggle', 'show');
				this.setState({ show: true });
				break;
			default:
				break;
		}
	}

	toggleModal(index, target, toggle) {
		if (toggle === 'show') {
			document.getElementById(`${target}${index}`).classList.replace('panel-hide', 'panel-show');
		} else {
			document.getElementById(`${target}${index}`).classList.replace('panel-show', 'panel-hide');
		}
	}

	addImg(control, index) {
		switch (control) {
			case 'background': {
				buildfire.imageLib.showDialog({ multiSelection: false }, (err, res) => {
					if (err) throw err;
					this.setState({ backgroundImg: res.selectedFiles[0] });
					this.update();
				});
				break;
			}
			case 'plugin': {
				buildfire.imageLib.showDialog({ multiSelection: false }, (err, res) => {
					if (err) throw err;
					// this.setState({ backgroundImg: res.selectedFiles[0] });
					// this.update();
					this.handleNodeChange(res.selectedFiles[0], index, 'src');
				});
				break;
			}
			case 'action': {
				buildfire.imageLib.showDialog({ multiSelection: false }, (err, res) => {
					if (err) throw err;
					// this.setState({ backgroundImg: res.selectedFiles[0] });
					// this.update();
					this.handleNodeChange(res.selectedFiles[0], index, 'src');
				});
				break;
			}
			case 'icon': {
				buildfire.imageLib.showDialog({ multiSelection: false, showFiles: false }, (err, res) => {
					if (err) throw err;
					this.setState({ iconUrl: res.selectedIcons[0] });

					this.update();
					// this.handleNodeChange(res.selectedFiles[0], index, 'icon');
				});
				break;
			}
			case 'hero': {
				buildfire.imageLib.showDialog({ multiSelection: false, showFiles: false }, (err, res) => {
					if (err) throw err;
					// this.setState({ iconUrl: res.selectedIcons[0] });
					this.handleNodeChange(res.selectedFiles[0], index, 'src');
					// this.update();
					// this.handleNodeChange(res.selectedFiles[0], index, 'icon');
				});
				break;
			}
			default: {
				let target = this.props.data.nodes[index];
				buildfire.imageLib.showDialog({}, (err, result) => {
					if (err) throw err;
					this.handleNodeChange(result.selectedFiles[0], index, 'src');
				});
			}
		}
	}

	colorPicker(index, target, attr) {
		let onchange = (err, res) => {
			if (err) throw err;
			// console.log(res);
		};
		let callback = (err, res) => {
			let css = '';
			if (err) throw err;
			console.log(res);
			// res.colorType === 'solid' ? (css = res.solid.backgroundCSS) : (css = res.gradient.backgroundCSS);
			// this.setState({ [attr]: css });
			console.log(this.state);
			this.setState({ [attr]: res });
			// switch (attr) {
			//   case "backgroundColor": {

			//     break;
			//   }
			//   default: return;
			// }
			// let customizations = this.state.customizations;
			// let customization = customizations.filter(ele => {
			//   console.log(ele);
			//   return ele.data.attr === attr;
			// });
			// let i = customizations.indexOf(customization);
			// console.log(i);
			// customization = {
			//   target,
			//   data: {
			//     attr,
			//     result: res
			//   }
			// };
			// if (i === -1) {
			//   customizations.push(customization);
			// } else {
			//   customizations[i] = customization;
			// }
			// this.setState({ customizations });
			this.update();
		};
		buildfire.colorLib.showDialog(this.state.backgroundColor, {}, onchange, callback);
	}

	componentDidMount() {
		this.setState({
			title: this.props.data.title,
			nodes: this.props.data.nodes,
			backgroundColor: this.props.data.backgroundColor,
			backgroundImg: this.props.data.backgroundImg,
			iconUrl: this.props.data.iconUrl
		});
		this.initSortable();
		this.initActionItems();
	}

	componentDidUpdate() {
		console.warn(this.state);
	}

	render() {
		return (
			<div>
				<div className="panel panel-default">
					<div className="panel-heading tab">
						<h3 className="panel-title tab-title">{this.props.data.title}</h3>
						<div className="toggle-group">
							<button className="btn tab-toggle" onClick={e => this.reorderPages(this.props.index, 1)}>
								Move Up
							</button>
							<button className="btn tab-toggle" onClick={e => this.reorderPages(this.props.index, 0)}>
								Move Down
							</button>
							<button className="btn tab-toggle" id={`tab${this.props.index}`} index={this.props.index} onClick={e => this.toggle(e)}>
								Edit
							</button>
						</div>
					</div>
					<div className="panel-body page-panel panel-hide" data-toggle="hide" id={`panel${this.props.index}`}>
						<div className="container">
							<div className="row">
								<div className="col-sm-12 header">
									<button className="btn" style="flex: 1; margin-bottom: 15px; margin-top: 15px;" id={`tab${this.props.index}`} index={this.props.index} onClick={e => this.toggle(e)}>
										Done
									</button>
								</div>
								<div className="col-sm-12">
									<div className="panel panel-default">
										<div className="panel-heading tab">
											<h3 className="panel-title tab-title">Page Config</h3>
											<div className="toggle-group">
												<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}optionsbutton`} index={`${this.props.index}`} onClick={e => this.toggle(e, 'options')}>
													{document.getElementById(`page${this.props.index}options`) ? (document.getElementById(`page${this.props.index}options`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
												</button>
											</div>
										</div>
										<div className="panel-body panel-hide" data-toggle="hide" id={`page${this.props.index}options`}>
											<form>
												<div className="input-group">
													<h4>Edit Page Title</h4>
													<input type="text" className="form-control" name="title" aria-describedby="sizing-addon2" value={this.props.data.title} onChange={this.handleChange} />
												</div>
											</form>
											<br />
											<div className="tab">
												<button className="btn btn-success tab-toggle" onClick={() => this.colorPicker(this.props.index, 'page', 'backgroundColor')}>
													Change background color
												</button>
												<button
													className="btn btn-danger"
													onClick={() => {
														this.setState({ backgroundColor: { colorType: false, solid: { backgroundCSS: '' }, gradient: { backgroundCSS: '' } } });
														this.update();
													}}>
													X
												</button>
											</div>
											<br />
											<div className="tab">
												<button className="btn btn-success tab-toggle" onClick={() => this.addImg('background')}>
													Add Background Image
												</button>
												<button
													className="btn btn-danger"
													onClick={() => {
														this.setState({ backgroundImg: {} });
														this.update();
													}}>
													X
												</button>
											</div>
											<br />
											<div className="tab">
												<button className="btn btn-success tab-toggle" onClick={() => this.addImg('icon')}>
													Add Nav Icon
												</button>
												<button
													className="btn btn-danger"
													onClick={() => {
														this.setState({ iconUrl: '' });
														this.update();
													}}>
													X
												</button>
											</div>
										</div>
									</div>
								</div>
								<div className="col-sm-12">
									<div style="margin-bottom: 20px;">
										<div className="btn-group tab" id={`menu${this.props.index}`}>
											<button
												className="btn btn-default add tab-toggle"
												onClick={e => {
													this.addNode('header');
												}}>
												Add Header
											</button>
											<button
												className="btn btn-default add tab-toggle"
												onClick={() => {
													this.addNode('desc');
												}}>
												Add Description
											</button>
											<button
												className="btn btn-default add tab-toggle"
												onClick={() => {
													this.addNode('image');
												}}>
												Add Image
											</button>
											<button
												className="btn btn-default add tab-toggle"
												onClick={() => {
													this.addNode('hero');
												}}>
												Add Hero Image
											</button>
											<button
												className="btn btn-default add tab-toggle"
												onClick={() => {
													this.toggleModal(this.props.index, 'plugins', 'show');
												}}>
												Add Plugin
											</button>
											<button
												className="btn btn-default add tab-toggle"
												onClick={() => {
													this.toggleModal(this.props.index, 'actions', 'show');
												}}>
												Add Action Item
											</button>
										</div>
										{/* </div> */}
									</div>
									<div className="col-sm-12">
										<div className="plugins panel-hide" id={`plugins${this.props.index}`}>
											<button
												className="btm btn-danger"
												style="position: relative; left: 10em; top: 10em;"
												onClick={() => {
													this.toggleModal(this.props.index, 'plugins', 'hide');
												}}>
												Cancel
											</button>
										</div>
									</div>
									<div className="col-sm-12">
										<div className="actions panel-hide" id={`actions${this.props.index}`}>
											<button
												className="btm btn-danger"
												style="position: relative; left: 10em; top: 10em;"
												onClick={() => {
													this.toggleModal(this.props.index, 'actions', 'hide');
												}}>
												Cancel
											</button>
										</div>
									</div>
								</div>
								<div className="col-sm-12">{this.renderNodes()}</div>
								<div className="col-sm-12 tab">
									<button className="btn btn-danger tab-toggle" onClick={this.delete}>
										Delete Page
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Page;
