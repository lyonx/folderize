import React, { Component } from 'react';

// --------------------------- CONTROL PAGE COMPONENT -------------------------- //
class Page extends Component {
	constructor(props) {
		super(props);
		this.updatePage = props.updatePage;
		this.deletePage = props.deletePage;
		this.reorderPages = props.reorderPages;
		this.key = props.key;
		this.update = this.update.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.delete = this.delete.bind(this);
		this.state = {
			title: props.data.title,
			nodes: [],
			show: false,
			backgroundColor: this.props.backgroundColor,
			backgroundImg: this.props.backgroundImg,
			iconUrl: this.props.iconUrl,
			backgroundCSS: ''
		};
	}

	// ------------------------- DATA HANDLING ------------------------- //

	// ON MOUNT...
	componentDidMount() {
		// this.state.backgroundColor ? (this.state.backgroundColor.colorType === 'solid' ? this.setState({ backgroundCSS: this.state.backgroundColor.solid.backgroundCSS }) : this.setState({ backgroundCSS: this.state.backgroundColor.gradient.backgroundCSS })) : null;
		// MOVE DATA TO STATE
		// console.warn(this.props);
		this.setState({
			title: this.props.data.title,
			nodes: this.props.data.nodes,
			backgroundColor: this.props.data.backgroundColor,
			backgroundImg: this.props.data.backgroundImg,
			iconUrl: this.props.data.iconUrl,
			backgroundCSS: this.props.data.backgroundColor ? (this.props.data.backgroundColor.colorType === 'solid' ? this.props.data.backgroundColor.solid.backgroundCSS : this.props.data.backgroundColor.gradient.backgroundCSS) : ''
		});

		let navigationCallback = e => {
			// console.log(e);
			let target = this.state.nodes.filter(node => {
				return node.instanceId === e.instanceId;
			});
			// console.log(target, this.state.nodes);
			let nodeIndex = this.state.nodes.indexOf(target[0]);
			// console.log(nodeIndex);
			// console.log(document.querySelector(`#page${this.props.index}node${nodeIndex}`));
			document.querySelector(`#page${this.props.index}node${nodeIndex}`).click();
		};

		this.editor = new buildfire.components.pluginInstance.sortableList(`#nodelist${this.props.index}`, [], { confirmDeleteItem: true }, false, false, { itemEditable: true, navigationCallback });

		this.editor.onOrderChange = () => {
			let nodes = this.state.nodes;
			nodes = this.editor.items;
			this.setState({ nodes });
			this.update();
		};

		this.editor.onDeleteItem = () => {
			let nodes = this.state.nodes;
			nodes = this.editor.items;
			this.setState({ nodes });
			this.update();
		};
	}

	componentDidUpdate() {
		// console.warn(this.state);
		this.editor.loadItems(this.state.nodes, false);
	}

	// USED TO EDIT NODES
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
				// let confirm = window.confirm("Are you sure? Item will be lost!");
				let confirm = buildfire.notifications.confirm(
					{
						title: 'Remove Node',
						message: 'Are you sure? Node will be lost!',
						buttonLabels: ['delete', 'cancel']
					},
					confirm => {
						if (confirm) {
							nodes.splice(index, 1);
							this.setState({
								nodes
							});
							this.update();
						}
					}
				);
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
				// console.log(event.target.checked);
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

	openLast() {
		let n = this.state.nodes.length - 1;
		document.querySelector(`#page${this.props.index}node${n}`).click();
	}

	// ADDS A NODE OBJECT OF THE CORRESPONDING TYPE
	addNode(type) {
		let nodes = this.props.data.nodes;
		switch (type) {
			case 'header': {
				nodes.push({
					type: 'header',
					title: 'header',
					instanceId: Date.now(),
					data: { text: 'new page' }
				});
				setTimeout(() => this.openLast(), 100);
				this.setState({ nodes });

				break;
			}
			case 'desc': {
				nodes.push({
					type: 'desc',
					title: 'text',
					instanceId: Date.now(),
					data: { text: 'You can edit this description in the control.' }
				});
				this.setState({ nodes });
				setTimeout(() => this.openLast(), 100);
				break;
			}
			case 'image': {
				nodes.push({
					type: 'image',
					title: 'image',
					instanceId: Date.now(),
					data: { src: 'https://images.unsplash.com/photo-1519636243899-5544aa477f70?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjQ0MDV9&s=6c937b3dbd83210ac77d8c591265cdf8' }
				});
				this.setState({ nodes });
				setTimeout(() => this.openLast(), 100);
				break;
			}
			case 'hero': {
				nodes.push({
					type: 'hero',
					title: 'hero',
					instanceId: Date.now(),
					data: { src: 'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjQ0MDV9&s=289571318ec59acf6bece7e8ece608af', header: 'Hero Header', subtext: 'Hero Subtext', showButton: false, buttonText: 'Go!' }
				});
				this.setState({ nodes });
				setTimeout(() => this.openLast(), 100);
				break;
			}
			case 'action': {
				buildfire.actionItems.showDialog({}, { showIcon: true }, (err, res) => {
					if (err) throw err;
					let nodes = this.state.nodes;
					nodes.push({
						type: 'action',
						title: res.action,
						data: res
					});
					this.setState({
						nodes: nodes
					});
					this.update();
				});
				break;
			}
			default:
				return;
		}
		// console.log(this.editor);

		this.update();
	}

	// USED TO CHANGE TO ORDER OF NODES
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

	// USED BY INPUT FEILDS TO UPDATE STATE
	handleChange(event) {
		const target = event.target;
		const name = target.name;
		this.setState({ [name]: event.target.value });
		if (event.type === 'input') {
			this.update();
		}
		// this.update();
	}

	// OPENS IMAGELIB DIALOG WITH SPECIFIC TARGET
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

	// OPENS COLOR PICKER WITH SPECIFIC TARGET
	colorPicker(attr) {
		buildfire.colorLib.showDialog(this.state.backgroundColor, {}, null, (err, res) => {
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
			this.setState({ [attr]: res, backgroundCSS: bgCSS });
			this.update();
		});
	}

	// DELETES THIS PAGE
	delete() {
		this.deletePage(this.props.index);
	}

	// PIPES CURRENT STATE TO CONTROL'S STATE, UPDATES PAGE AT THIS INDEX
	update() {
		this.updatePage(this.props.index, {
			title: this.state.title,
			instanceId: this.props.data.instanceId,
			images: this.state.images,
			nodes: this.state.nodes,
			show: this.state.show,
			customizations: this.state.customizations,
			backgroundColor: this.state.backgroundColor,
			backgroundImg: this.state.backgroundImg,
			iconUrl: this.state.iconUrl
		});
	}

	// USED TO TOGGLE MODALS OR PANELS
	toggle(e, type) {
		// console.log(Date.now());
		if (!e.target.id) return;
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
			case 'addnodes': {
				panel = document.getElementById(`page${document.getElementById(e.target.id).getAttribute('index')}addnodes`);
				if (panel.getAttribute('data-toggle') === 'hide') {
					panel.style.display = 'block';
					panel.setAttribute('data-toggle', 'show');
				} else {
					panel.style.display = 'none';
					panel.setAttribute('data-toggle', 'hide');
				}
				return;
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

	// USED TO TOGGLE A SPECIAL MODAL FOR PLUGINS AND ACTION NODE CREATION
	toggleModal(index, target, toggle) {
		if (toggle === 'show') {
			document.getElementById(`${target}${index}`).classList.replace('panel-hide', 'panel-show');
		} else {
			document.getElementById(`${target}${index}`).classList.replace('panel-show', 'panel-hide');
		}
	}

	// --------------------------- RENDERING --------------------------- //

	// LOOPS THROUGH THE NODES AND RETURNS ELEMENTS OF THE CORRESPONDING TYPE
	renderNodes() {
		let nodes = [];
		this.props.data.nodes.forEach(node => {
			if (!node) return;
			let index = this.props.data.nodes.indexOf(node);
			switch (node.type) {
				case 'header': {
					nodes.push(
						<div>
							<div className="panel panel-default" style={'display:none'}>
								<div className="panel-heading tab">
									<h3 className="panel-title tab-title">Header</h3>
									<div className="toggle-group">
										<button
											className="btn btn-deafult tab-toggle"
											id={`page${this.props.index}node${index}`}
											index={`${index}`}
											page={`${this.props.index}`}
											onClick={e => {
												this.toggle(e, 'node');
											}}>
											{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>
									</div>
								</div>
							</div>
							<div className="panel-hide modal-wrap" data-toggle="hide" id={`page${this.props.index}nodepanel${index}`}>
								<div
									className="backdrop"
									id={`page${this.props.index}node${index}`}
									index={`${index}`}
									page={`${this.props.index}`}
									onClick={e => {
										e.preventDefault();
										e.stopPropagation();
										// e.nativeEvent.stopImmediatePropagation();
										// e.nativeEvent.stopPropagation();
										this.toggle(e, 'node');
									}}
								/>
								<div className="panel-body nodepanel">
									<div className="input-group">
										<input type="text" className="form-control" name="heading" aria-describedby="sizing-addon2" value={node.data.text} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'text')} />
									</div>
									<div className="tab">
										<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} page={`${this.props.index}`} onClick={e => this.toggle(e, 'node')}>
											{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>
										<button className="btn btn-danger tab-toggle" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete')}>
											Remove
										</button>
									</div>
								</div>
							</div>
						</div>
					);
					break;
				}
				case 'desc': {
					nodes.push(
						<div>
							<div className="panel panel-default" style={'display:none'}>
								<div className="panel-heading tab">
									<h3 className="panel-title tab-title">Description</h3>
									<div className="toggle-group">
										<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 1)}>
											<span className="glyphicon glyphicon-chevron-up" aria-hidden="true" />
										</button>
										<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 0)}>
											<span className="glyphicon glyphicon-chevron-down" aria-hidden="true" />
										</button>
										<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
											{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>
									</div>
								</div>
							</div>
							<div className="panel-hide modal-wrap" data-toggle="hide" id={`page${this.props.index}nodepanel${index}`}>
								<div
									className="backdrop"
									id={`page${this.props.index}node${index}`}
									index={`${index}`}
									page={`${this.props.index}`}
									onClick={e => {
										this.toggle(e, 'node');
									}}
								/>
								<div className="panel-body nodepanel" data-toggle="hide">
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
										<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
											{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>
										<button className="btn btn-danger tab-toggle" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete')}>
											Remove
										</button>
									</div>
								</div>
							</div>
						</div>
					);
					break;
				}
				case 'image': {
					nodes.push(
						<div>
							<div className="panel panel-default" style={'display:none'}>
								<div className="panel-heading tab">
									<h3 className="panel-title tab-title">Image</h3>
									<div className="toggle-group">
										<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 1)}>
											<span className="glyphicon glyphicon-chevron-up" aria-hidden="true" />
										</button>
										<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 0)}>
											<span className="glyphicon glyphicon-chevron-down" aria-hidden="true" />
										</button>
										<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
											{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>
									</div>
								</div>
							</div>
							<div className="panel-hide modal-wrap" data-toggle="hide" id={`page${this.props.index}nodepanel${index}`}>
								<div
									className="backdrop"
									id={`page${this.props.index}node${index}`}
									index={`${index}`}
									page={`${this.props.index}`}
									onClick={e => {
										this.toggle(e, 'node');
									}}
								/>
								<div className="panel-body  nodepanel">
									<div className="tab">
										<div className="plugin-thumbnail" style={`background: url('${node.data.src}')`} />
										<button className="btn btn-success tab-toggle" onClick={() => this.addImg('node', this.props.data.nodes.indexOf(node))}>
											Change Image
										</button>
									</div>
									<div className="tab">
										<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
											{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>

										<button className="btn btn-danger" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete')}>
											X
										</button>
									</div>
								</div>
							</div>
						</div>
					);
					break;
				}
				case 'plugin': {
					if (!node.data) return;
					nodes.push(
						<div>
							<div className="panel panel-default" style={'display:none'}>
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
										<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
											{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>
									</div>
								</div>
							</div>
							<div className="panel-body panel-hide nodepanel" id={`page${this.props.index}nodepanel${index}`} data-toggle="hide">
								<div className="plugin">
									<div className="plugin-thumbnail" style={`background: url("${node.data.iconUrl}")`} alt="..." onClick={e => this.addImg(null, this.props.data.nodes.indexOf(node))} />
									{/* <h3 className="plugin-title">{node.data.title}</h3> */}
									<div className="input-group tab-toggle" style="margin-left:15px;">
										<input type="text" className="plugin-title form-control" name="plugin" aria-describedby="sizing-addon2" value={node.data.title} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'plugin')} />
									</div>
								</div>
								<hr />
								<div className="tab">
									<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
										{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
									</button>
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
						<div>
							<div className="panel panel-default" style={'display:none'}>
								<div className="panel-heading tab">
									<h3 className="panel-title tab-title">Action</h3>
									<div className="toggle-group">
										<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 1)}>
											<span className="glyphicon glyphicon-chevron-up" aria-hidden="true" />
										</button>
										<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 0)}>
											<span className="glyphicon glyphicon-chevron-down" aria-hidden="true" />
										</button>
										<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
											{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>
									</div>
								</div>
							</div>
							<div className="panel-hide modal-wrap" data-toggle="hide" id={`page${this.props.index}nodepanel${index}`}>
								<div
									className="backdrop"
									id={`page${this.props.index}node${index}`}
									index={`${index}`}
									page={`${this.props.index}`}
									onClick={e => {
										this.toggle(e, 'node');
									}}
								/>
								<div className="panel-body nodepanel">
									<div className="action">
										<div className="action-thumbnail" style={`background: url("${node.data.iconUrl}")`} alt="..." onClick={e => this.addImg(null, this.props.data.nodes.indexOf(node))} />
										<h3 className="action-title">{node.data.title}</h3>
									</div>
									<hr />
									<div className="tab">
										<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}node${index}`} page={`${this.props.index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
											{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>
										<button
											className="btn btn-success tab-toggle"
											onClick={e => {
												// console.log(node);
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
						</div>
					);
					break;
				}
				case 'hero': {
					nodes.push(
						<div>
							<div className="panel panel-default" style={'display:none'}>
								<div className="panel-heading tab">
									<h3 className="panel-title tab-title">Hero</h3>
									<div className="toggle-group">
										<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 1)}>
											<span className="glyphicon glyphicon-chevron-up" aria-hidden="true" />
										</button>
										<button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 0)}>
											<span className="glyphicon glyphicon-chevron-down" aria-hidden="true" />
										</button>
										<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
											{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>
									</div>
								</div>
							</div>
							<div className="panel-body panel-hide nodepanel" data-toggle="hide" id={`page${this.props.index}nodepanel${index}`}>
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

	render() {
		return (
			<div>
				<div className="panel panel-default no-border">
					<div className="panel-heading tab panel-hide">
						<div className="toggle-group">
							<button className="btn tab-toggle" id={`tab${this.props.index}`} index={this.props.index} onClick={e => this.toggle(e)}>
								Edit
							</button>
						</div>
					</div>
					<div className="modal-wrap panel-hide" data-toggle="hide" id={`panel${this.props.index}`}>
						<div
							className="backdrop"
							id={`panel${this.props.index}backdrop`}
							index={`${this.props.index}`}
							page={`${this.props.index}`}
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								// e.nativeEvent.stopImmediatePropagation();
								// e.nativeEvent.stopPropagation();
								this.toggle(e);
							}}
						/>
						<div className="panel-body nodepanel" style="top: 10%; height: 80%">
							<div className="container">
								<div className="row">
									<div className="col-sm-12 header" />
									<form>
										<div className="input-group">
											<h4>Edit Page Title</h4>
											<input type="text" className="form-control" name="title" aria-describedby="sizing-addon2" value={this.props.data.title} onChange={this.handleChange} />
										</div>
									</form>
									<div className="col-sm-12">
										<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}optionsbutton`} index={`${this.props.index}`} onClick={e => this.toggle(e, 'options')}>
											{document.getElementById(`page${this.props.index}options`) ? (document.getElementById(`page${this.props.index}options`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>
										<button className="btn btn-deafult tab-toggle" id={`page${this.props.index}addnodesbutton`} index={`${this.props.index}`} onClick={e => this.toggle(e, 'addnodes')}>
											Add Nodes
										</button>
										{/* ------- Config ------ */}
										<div className="panel-hide modal-wrap" data-toggle="hide" id={`page${this.props.index}options`}>
											<div className="backdrop" id={`page${this.props.index}optionsbutton`} index={`${this.props.index}`} onClick={e => this.toggle(e, 'options')}>
												<div className="panel-body nodepanel" data-toggle="hide">
													<br />
													<div className="tab">
														<h4 className="tag" style="width: 33%">
															Background Color:{' '}
														</h4>
														<button className={`btn thumbnail page${this.props.index}color`} onClick={() => this.colorPicker('backgroundColor')} style={`${this.state.backgroundCSS}`}>
															{this.state.backgroundColor ? (this.state.backgroundColor.colorType ? `${this.state.backgroundColor.colorType}` : 'Add Background Color') : null}
														</button>

														<button
															className="btn btn-danger"
															onClick={() => {
																this.setState({ backgroundColor: { colorType: false, solid: { backgroundCSS: '' }, gradient: { backgroundCSS: '' } } });
																this.update();
															}}>
															Remove
														</button>
													</div>
													<br />
													<div className="tab">
														<h4 className="tag" style="width: 33%">
															Background Image:{' '}
														</h4>
														<button className="btn thumbnail" style={this.state.backgroundImg ? `background: url("${this.state.backgroundImg}")` : `background: #33333`} onClick={() => this.addImg('background')}>
															{typeof this.state.backgroundImg === 'string' ? 'Change Background Image' : 'Add Background Image'}
														</button>
														<button
															className="btn btn-danger"
															onClick={() => {
																this.setState({ backgroundImg: {} });
																this.update();
															}}>
															Remove
														</button>
													</div>
													<br />
													<div className="tab">
														<h4 className="tag" style="width: 33%">
															Navigation Icon:{' '}
														</h4>
														<button className="btn thumbnail" onClick={() => this.addImg('icon')}>
															{this.state.iconUrl ? <span className={`glyphicon ${this.state.iconUrl}`} /> : 'Add Icon'}
														</button>
														<button
															className="btn btn-danger"
															onClick={() => {
																this.setState({ iconUrl: '' });
																this.update();
															}}>
															Remove
														</button>
													</div>
													<button
														className="btn btn-deafult tab-toggle"
														id={`page${this.props.index}optionsbutton`}
														index={`${this.props.index}`}
														onClick={e => {
															if (!document.querySelector(`page${this.props.index}optionsbutton`)) return;
															document.querySelector(`page${this.props.index}optionsbutton`).click();
														}}>
														Done
													</button>
												</div>
											</div>
										</div>
									</div>
									{/* <div className="panel-hide modal-wrap" data-toggle="hide" id={`page${this.props.index}addnodes`}> */}
									<div id={`page${this.props.index}addnodes`} className="addnodes" data-toggle="hide">
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
															// this.toggleModal(this.props.index, 'actions', 'show');
															this.addNode('action');
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
									</div>

									{/* </div> */}
									<div className="col-sm-12">{this.renderNodes()}</div>
									<div className="col-sm-12" id={`nodelist${this.props.index}`} />
									<div className="tab modal-footer">
										<button className="btn tab-toggle" id={`tab${this.props.index}`} index={this.props.index} onClick={e => this.toggle(e)}>
											Done
										</button>
										<button className="btn btn-danger tab-toggle" onClick={this.delete}>
											Delete Page
										</button>
									</div>
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
