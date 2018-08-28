import React, { Component } from 'react';

// --------------------------- CONTROL PAGE COMPONENT -------------------------- //
class Page extends Component {
	constructor(props) {
		super(props);
		this.updatePage = props.updatePage;
		this.deletePage = props.deletePage;
		this.key = props.key;
		this.update = this.update.bind(this);
		this.reorderNodes = props.reorderNodes;
		this.handleChange = props.handleChange;
		this.handleNodeChange = props.handleNodeChange;
		this.colorPicker = props.colorPicker;
		this.delete = this.delete.bind(this);
		this.initEditor = this.initEditor.bind(this);
		this.addNode = props.addNode;
		this.addImg = props.addImg;
		// this.state = {
		// 	title: props.data.title,
		// 	nodes: [],
		// 	show: false,
		// 	backgroundColor: this.props.backgroundColor,
		// 	backgroundImg: this.props.backgroundImg,
		// 	iconUrl: this.props.iconUrl,
		// 	backgroundCSS: '',
		// 	tutorials: this.props.tutorials
		// };
		this.state = {
			index: null,
			title: '',
			nodes: [],
			show: false,
			backgroundColor: {},
			backgroundImg: {},
			iconUrl: '',
			backgroundCSS: ''
			// tutorials: false
		};
	}

	// ----------------------- LIFECYCLE METHODS ----------------------- //

	// ON MOUNT INIT SORTABLE NODE LIST
	componentDidMount() {
		console.warn(this.props);

		// Unknown bug caused main panel to render with the wrong attributes
		let panel = document.getElementById(`panel${this.props.index}`);
		if (panel.getAttribute('data-toggle') === 'show') {
			panel.setAttribute('data-toggle', 'hide');
			panel.classList.replace('panel-show', 'panel-hide');
		}

		let title = '';
		this.props.data.title.length > 0 ? (title = this.props.data.title) : (title = 'untitled');

		// this.setState({ tutorials: this.props.tutorials });
		this.initEditor();
		this.editor.loadItems(this.props.data.nodes, false);
	}
	// ON UPDATE, REFRESH THE SORTABLE NODE LIST'S DATA
	componentDidUpdate() {
		console.warn(this.props);

		this.editor.loadItems(this.props.data.nodes, false);
	}

	// ------------------------- DATA HANDLING ------------------------- //

	// SET UP THE SORTABLE NODE LIST
	initEditor() {
		let navigationCallback = e => {
			let target = this.props.data.nodes.filter(node => {
				return node.instanceId === e.instanceId;
			});

			//
			let nodeIndex = this.props.data.nodes.indexOf(target[0]);
			//

			document.querySelector(`#page${this.props.index}node${nodeIndex}`).click();
		};

		this.editor = new buildfire.components.pluginInstance.sortableList(`#nodelist${this.props.index}`, [], { confirmDeleteItem: true }, false, false, { itemEditable: true, navigationCallback });

		this.editor.onOrderChange = () => {
			this.reorderNodes(this.props.index, this.editor.items);
		};

		this.editor.onDeleteItem = () => {
			this.reorderNodes(this.props.index, this.editor.items);
		};
	}
	// OPEN THE LAST NODE ADDED
	openLast() {
		let n = this.props.data.nodes.length - 1;
		document.querySelector(`#page${this.props.index}node${n}`).click();
	}
	// DELETES THIS PAGE
	delete() {
		buildfire.notifications.confirm(
			{
				title: 'Remove Page',
				message: 'Are you sure? Page will be lost!',
				buttonLabels: ['delete', 'cancel']
			},
			(err, result) => {
				if (err) {
					if (typeof err === 'boolean') {
						this.deletePage(this.props.index);
					} else {
						throw err;
					}
				} else {
					if (!result) return;

					if (result.selectedButton.key === 'confirm') {
						this.deletePage(this.props.index);
					}
				}
			}
		);
	}
	// PIPES CURRENT STATE TO CONTROL'S STATE, UPDATES PAGE AT THIS INDEX
	update(updateAll, target) {
		if (!updateAll) {
			updateAll = '';
			this.updatePage(this.props.index, {
				title: this.props.data.title,
				instanceId: this.props.data.instanceId,
				images: this.props.data.images,
				nodes: this.props.data.nodes,
				show: this.props.data.show,
				customizations: this.props.data.customizations,
				backgroundColor: this.props.data.backgroundColor,
				backgroundImg: this.props.data.backgroundImg,
				iconUrl: this.props.data.iconUrl
			});
		} else {
			let data = {};
			switch (target) {
				case 'color':
					data.backgroundColor = this.props.data.backgroundColor;
					break;
				case 'img':
					data.backgroundImg = this.props.data.backgroundImg;
					break;
				default:
					return;
			}

			this.updatePage(this.props.index, data, true);
		}
	}
	// USED TO TOGGLE MODALS OR PANELS
	toggle(e, type) {
		if (!e.target.id) return;
		let panel;
		switch (type) {
			case 'node': {
				let index = document.getElementById(e.target.id).getAttribute('index');
				panel = document.getElementById(`page${this.props.index}nodepanel${index}`);
				if (panel.getAttribute('data-toggle') === 'hide') {
					buildfire.messaging.sendMessageToWidget({
						nodeIndex: index,
						pageIndex: this.props.index
					});
				}
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
				break;
			case 'hide':
				panel.classList.remove('panel-hide');
				panel.classList.add('panel-show');
				panel.setAttribute('data-toggle', 'show');
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
		this.props.data.nodes.forEach((node, index) => {
			if (!node) return;
			// let index = this.props.data.nodes.indexOf(node);
			switch (node.type) {
				case 'header': {
					nodes.push(
						<div>
							<div className="panel panel-default" style={'display:none'}>
								<div className="panel-heading tab">
									<h3 className="panel-title tab-title">Header</h3>
									<div className="toggle-group">
										<button
											className="btn btn-success tab-toggle"
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
									<h4>Header Text</h4>
									<div className="input-group">
										<input type="text" className="form-control" name="heading" aria-describedby="sizing-addon2" value={node.data.text} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'text', false, this.props.index)} />
									</div>
									{/* <form>
										<input
											type="number"
											value={node.data.layout}
											onChange={e => {
												this.handleNodeChange(e, index, 'layout');
											}}
										/>
									</form> */}
									<form>
										<label Htmlfor="show-border">Show Border</label>
										<input
											type="checkbox"
											name="show-border"
											onChange={e => {
												this.handleNodeChange(e, index, 'header', 'border', this.props.index);
											}}
											checked={node.data.border}
										/>
									</form>
									<br />
									<div className="tab">
										<button className="btn btn-success" id={`page${this.props.index}node${index}`} index={`${index}`} page={`${this.props.index}`} onClick={e => this.toggle(e, 'node')}>
											{/* {document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'} */}
											<span className="glyphicon glyphicon-ok" />
											{'  '}
											Done
										</button>
										<button className="btn btn-danger" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete', false, this.props.index)}>
											<span className="glyphicon glyphicon-alert" />
											{'  '}
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
										<button className="btn btn-success tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
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
									<h4>Description Text</h4>
									<div className="input-group">
										<textarea
											type="text"
											// className="form-control"
											style="width: 100%; height: 100px"
											name="desc"
											aria-describedby="sizing-addon2"
											value={node.data.text}
											onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'text', false, this.props.index)}
										/>
									</div>
									<div className="tab">
										<button className="btn btn-success" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
											{/* {document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'} */}
											<span className="glyphicon glyphicon-ok" />
											{'  '}
											Done
										</button>
										<button className="btn btn-danger" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete', false, this.props.index)}>
											<span className="glyphicon glyphicon-alert" />
											{'  '}
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
										<button className="btn btn-success tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
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
									<h4 className="text-center">Selected Image:</h4>
									<div className="plugin-thumbnail" title="Click to change Image." style={`background: url('${node.data.src}')`} onClick={() => this.addImg('node', this.props.data.nodes.indexOf(node), this.props.index)} />
									<h6 className="text-center">Click to change</h6>
									<div className="container">
										<div className="item row margin-bottom-twenty clearfix">
											<div className="col-md-3 padding-right-zero pull-left">
												<span>Sizing: </span>
											</div>
											<div className="main col-md-9 pull-right">
												{/* <div className="tab"> */}
												<span title="Makes this image full screen with a header and subtext." style="pointer-events: all">
													<label>Full screen {'  '}</label>

													<input type="checkbox" name="hero" id={`${node.instanceId}`} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'img', false, this.props.index)} checked={node.format === 'hero' ? true : false} />
													{/* </div> */}
													{/* <div className="tab"> */}
												</span>
												<span title="Allows you to define a custom height for this image." style="pointer-events: all">
													<label>Custom {'  '}</label>

													<input type="checkbox" name="custom" id={`${node.instanceId}`} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'img', false, this.props.index)} checked={node.format === 'custom' ? true : false} />
												</span>
											</div>
										</div>
									</div>
									{node.format === 'custom' ? (
										<div>
											{/* <div className="input-group" style="line-height: 32px;">
												<label htmlFor="size">Image height: </label>
												<input
													title="Sets the image height"
													type="number"
													step="0.01"
													className="form-control"
													style="width: 66vw; float: right;"
													name="size"
													value={node.data.height}
													onChange={e => {
														let height = parseFloat(e.target.value);
														this.handleNodeChange(height, this.props.data.nodes.indexOf(node), 'img', false, this.props.index);
													}}
												/>
											</div> */}
											<div className="input-group" style="line-height: 32px;">
												<label htmlFor="size">Image height: </label>
												<input
													type="number"
													value={node.data.height * 100}
													style="width: 9vw"
													step="1"
													onChange={e => {
														let height = parseFloat(e.target.value) / 100;
														this.handleNodeChange(height, this.props.data.nodes.indexOf(node), 'img', false, this.props.index);
													}}
												/>
												<input
													title="Sets the image height"
													type="range"
													min="1"
													max="150"
													// step="0.01"
													className="form-control img-slider"
													style="width: 60vw; float: right;"
													name="size"
													value={node.data.height * 100}
													onChange={e => {
														let height = parseFloat(e.target.value) / 100;
														this.handleNodeChange(height, this.props.data.nodes.indexOf(node), 'img', false, this.props.index);
													}}
												/>
											</div>
										</div>
									) : (
										<div />
									)}
									{node.format === 'hero' ? (
										<div>
											<div className="input-group">
												<input type="text" className="form-control" name="header" aria-describedby="sizing-addon2" value={node.data.header} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'hero-header', false, this.props.index)} />
											</div>
											<div className="input-group">
												<input type="text" className="form-control" name="subtext" aria-describedby="sizing-addon2" value={node.data.subtext} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'hero-subtext', false, this.props.index)} />
											</div>
										</div>
									) : (
										<div />
									)}
									<div className="tab">
										<button className="btn btn-success" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
											{/* {document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'} */}
											<span className="glyphicon glyphicon-ok" />
											{'  '}
											Done
										</button>

										<button className="btn btn-danger" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete', false, this.props.index)}>
											<span className="glyphicon glyphicon-alert" />
											{'  '}
											Remove
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
										<button className="btn btn-success tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
											{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
										</button>
									</div>
								</div>
							</div>
							<div className="panel-body panel-hide nodepanel" id={`page${this.props.index}nodepanel${index}`} data-toggle="hide">
								<div className="plugin">
									<div className="plugin-thumbnail" style={`background: url("${node.data.iconUrl}")`} alt="..." onClick={e => this.addImg(null, this.props.data.nodes.indexOf(node), this.props.index)} />
									{/* <h3 className="plugin-title">{node.data.title}</h3> */}
									<div className="input-group tab-toggle" style="margin-left:15px;">
										<input type="text" className="plugin-title form-control" name="plugin" aria-describedby="sizing-addon2" value={node.data.title} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'plugin', false, this.props.index)} />
									</div>
								</div>
								<hr />
								<div className="tab">
									<button className="btn btn-success tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
										{document.getElementById(`page${this.props.index}nodepanel${index}`) ? (document.getElementById(`page${this.props.index}nodepanel${index}`).getAttribute('data-toggle') === 'hide' ? 'Edit' : 'Done') : 'Edit'}
									</button>
									<button className="btn btn-danger tab-toggle" onClick={e => this.handleNodeChange(e, index, 'delete', false, this.props.index)}>
										<span className="glyphicon glyphicon-alert" />
										{'  '}
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
					let defaultImgDiag = (
						<div style={'position: absolute; right: 15px; z-index: 10000'}>
							<label Htmlfor="defaultImg">Use Default Plugin Image</label>
							<input
								name="defaultImg"
								id={`defaultImg${index}`}
								type="checkbox"
								onChange={e => {
									switch (e.target.checked) {
										case true:
											{
												localStorage.setItem(`prevImg${node.instanceId}`, node.data.iconUrl);
												buildfire.pluginInstance.get(node.data.instanceId, (err, inst) => {
													if (err) throw err;
													node.data.iconUrl = inst.iconUrl;
													this.update();
												});
											}
											break;
										case false:
											{
												let prevImg = localStorage.getItem(`prevImg${node.instanceId}`);

												if (prevImg === 'undefined') prevImg = false;
												if (prevImg) {
													this.handleNodeChange(prevImg, index, 'src', false, this.props.index);
												} else {
													this.addImg('action', this.props.data.nodes.indexOf(node), this.props.index);
												}
											}
											break;
										default:
											break;
									}
								}}
								checked={node.data.iconUrl ? (node.data.iconUrl.indexOf('/plugins/') > -1 ? true : false) : false}
							/>
						</div>
					);

					let linkOnly = (
						<div style={'position: absolute; right: 15px; z-index: 10000'}>
							<label Htmlfor="link-only">Link Only</label>
							<input
								name="link-only"
								id={`linkOnly${index}`}
								type="checkbox"
								onChange={e => {
									switch (e.target.checked) {
										case true:
											{
												node.format = 'linkOnly';
												this.update();
											}
											break;
										case false:
											{
												node.format = 'default';
												this.update();
											}
											break;
										default:
											break;
									}
								}}
								checked={node.format === 'linkOnly' ? true : false}
							/>
						</div>
					);
					let image;
					node.data.iconUrl ? (image = node.data.iconUrl) : (image = './assets/noImg.PNG');
					nodes.push(
						<div>
							<div className="panel panel-default" style={'display:none'}>
								<div className="panel-heading tab">
									<h3 className="panel-title tab-title">Action</h3>
									<div className="toggle-group">
										<button className="btn btn-success tab-toggle" id={`page${this.props.index}node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
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
									{node.data.action === 'linkToApp' ? defaultImgDiag : null}
									{node.data.action === 'linkToWeb' ? linkOnly : null}
									{/* <div className="panel-hide">
										{node.data.iconUrl
											? null
											: setTimeout(() => {
													document.getElementById(`defaultImg${index}`).checked = true;
													buildfire.pluginInstance.get(node.data.instanceId, (err, inst) => {
														if (err) throw err;
														node.data.iconUrl = inst.iconUrl;
														this.update();
													});
											  }, 100)}
									</div> */}
									{/* <div className="action"> */}
									<h4 className="text-center">Selected Image:</h4>
									{node.format === 'linkOnly' ? (
										false
									) : (
										<div>
											<div className="plugin-thumbnail" title="Click to change Image. You can change the appearance of Action Items in the Design tab." style={`background: url("${image}")`} alt="..." onClick={e => this.addImg('action', this.props.data.nodes.indexOf(node), this.props.index)} />
											<h6 className="text-center">Click to change</h6>
										</div>
									)}

									<h3 className="action-title">Action Text: {node.data.title ? node.data.title : 'Untitled'}</h3>
									{/* </div> */}
									<hr />
									<div className="tab">
										<button
											className="btn btn-success"
											id={`page${this.props.index}node${index}`}
											page={`${this.props.index}`}
											index={`${index}`}
											onClick={e => {
												localStorage.removeItem(`prevImg${node.instanceId}`);
												this.toggle(e, 'node');
											}}>
											<span className="glyphicon glyphicon-ok" />
											{'  '}
											Done
										</button>
										<button
											className="btn btn-primary"
											onClick={e => {
												//
												buildfire.actionItems.showDialog(node.data, {}, (err, res) => {
													if (err) throw err;
													if (!res) return;
													node.data = res;
													node.title = `Action Item: ${res.title}`;
													this.update();
												});
											}}>
											<span className="glyphicon glyphicon-wrench" />
											{'  '}
											Edit
										</button>
										<button className="btn btn-danger" onClick={e => this.handleNodeChange(e, index, 'delete', false, this.props.index)}>
											<span className="glyphicon glyphicon-alert" />
											{'  '}
											Remove
										</button>
									</div>
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

		// REPLACE DEFAULT SORTABLE LIST DELETE BUTTON
		setTimeout(() => {
			let listItems = document.querySelector(`#nodelist${this.props.index}`).childNodes[0].childNodes[1].childNodes[2].childNodes;
			listItems.forEach((item, index) => {
				let btn = item.childNodes[1].childNodes[1].childNodes[0];
				let tab = btn.parentNode;
				let clone = btn.cloneNode();

				let view = document.createElement('span');
				view.setAttribute('title', 'Scrolls this Element into view and highlights it.')
				let label = document.createElement('span');
				label.innerHTML = 'Peek  ';
				let icon = document.createElement('span');
				icon.classList.add('glyphicon');
				icon.classList.add('glyphicon-eye-open');

				view.appendChild(label);
				view.appendChild(icon);

				tab.removeChild(btn);
				tab.appendChild(view);
				tab.appendChild(clone);
				clone.addEventListener('click', e => this.handleNodeChange(e, index, 'delete', false, this.props.index));
				view.addEventListener('click', e => {
					buildfire.messaging.sendMessageToWidget({
						nodeIndex: index,
						pageIndex: this.props.index
					});
				});
			});
		}, 200);
		return nodes;
	}

	render() {
		return (
			<div title="">
				<div className="panel panel-default no-border">
					<div className="panel-heading tab panel-hide">
						<div className="toggle-group">
							<button
								className="btn tab-toggle"
								id={`tab${this.props.index}`}
								index={this.props.index}
								onClick={e => {
									this.toggle(e);
								}}>
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
								// this.state.tutorials ? this.toggleTutorials('off') : null;
								this.toggle(e);
							}}
						/>
						<div className="panel-body pagepanel">
							<div className="container">
								<div className="row">
									{/* ------ PAGE TITLE ------ */}
									<div className="col-sm-12 header" />
									<form>
										<div className="input-group">
											<h4>
												Edit Page Title
												<span style={'margin-left: 10px;'} className="glyphicon glyphicon-info-sign tooltip-custom">
													<div className="alert alert-info tooltip-info">You can change the Page title here. This apprears in the Navbar if no icon is selected.</div>
												</span>
											</h4>

											<input title="This will appear on the navbar unless an Icon is selected for this page." type="text" className="form-control" name="title" aria-describedby="sizing-addon2" value={this.props.data.title} onChange={e => this.handleChange(e, this.props.index)} />
										</div>
									</form>

									{/* ------- Config ------ */}
									<div className="col-sm-12">
										<div className="panel-hide modal-wrap" data-toggle="hide" id={`page${this.props.index}options`}>
											<div className="backdrop" id={`page${this.props.index}optionsbutton`} index={`${this.props.index}`} onClick={e => this.toggle(e, 'options')}>
												<div className="panel-body nodepanel" data-toggle="hide">
													{/* BG COLOR */}
													{/* <div className="tab">
														<div>
															<h4 className="tag" style="width: 33%">
																Background Color:{' '}
															</h4>
															<a onClick={() => this.update(true, 'color')}>Apply to all</a>
														</div> */}
													<ul className="list-group">
														<li className="list-group-item border-none" style="padding: 0px;">
															<div className="padding-top-twenty clearfix">
																Custom Background
																<hr className="margin-top-ten margin-bottom-ten" style="height: 1px;" />
																<div className="screens col-md-6 clearfix" style="float: left;">
																	<div className="row text-left">
																		<label className="text-light-grey small margin-left-five">Image</label>
																	</div>
																	<div className="row clearfix">
																		<div className="col-md-6">
																			<div className="screen ipads pull-left text-center" style="width: 100%">
																				<a className="border-radius-four default-background-hover" onClick={() => this.addImg('background', null, this.props.index)}>
																					<span className="add-icon">+</span>
																					<img src={this.props.data.backgroundImg} />
																				</a>
																				<span
																					className="icon btn-delete-icon btn-danger transition-third ng-hide"
																					style={this.props.data.backgroundImg ? 'pointer-events: all' : 'display: none'}
																					onClick={() => {
																						this.addImg('background', null, this.props.index, true);
																					}}
																				/>
																				<div className="row padding-left-ten">
																					<label className="secondary">750x1043</label>
																				</div>
																			</div>
																			{/* <div className="screen ipads pull-left text-center" style="width: 25%">
																			<a className="border-radius-four default-background-hover">
																				<span className="add-icon">+</span>
																				<img />
																			</a>
																			<span className="icon btn-delete-icon btn-danger transition-third ng-hide" />
																			<div className="row padding-left-ten">
																				<label className="secondary">1536x2048</label>
																			</div>
																		</div> */}
																		</div>
																	</div>
																</div>
																<div className="col-md-6 margin-bottom-ten" style="float: left;">
																	<div className="row text-left">
																		<label className="text-light-grey small margin-left-five">Background Color</label>
																	</div>
																	<div className="row">
																		{/* <div className="main col-md-8 pull-left custom-switch padding-left-zero">
																			<a className={this.props.data.backgroundColor ? 'btn' : `btn btn-primary` } id="color-on" onClick={() => {
																				let settings = this.state.settings;
																				settings.backgroundColor.display = true;
																			}}>
																				On
																			</a>
																			<a className={this.props.data.backgroundColor ? `btn btn-primary` : 'btn' } id="color-off" onClick={() => {
																				let settings = this.state.settings;
																				settings.backgroundColor.display = false;
																			}}>
																				Off
																			</a>
																		</div> */}
																		<div className="col-md-3 pull-left">
																			<div className="colorgrid pull-left">
																				<div className="gradient-results">
																					<div className="coloritem margin-bottom-zero">
																						<a className="img-thumbnail">
																							<span className="color border-radius-four border-grey relative-position" onClick={() => this.colorPicker('backgroundColor', this.props.index)} style={`${this.props.data.backgroundCSS}; pointer-events: all; position: relative;`}>
																								{this.props.data.backgroundColor.colorType === false ? <div className="color-not-selected" /> : null}
																							</span>
																						</a>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div className="col-md-3 pull-left">
																			<button
																				className="btn btn-danger"
																				disabled={this.props.data.backgroundColor.colorType === false ? true : false}
																				onClick={() => {
																					this.colorPicker('backgroundColor', this.props.index, true);
																				}}>
																				Remove
																			</button>
																		</div>
																	</div>
																</div>
																<br />
															</div>
														</li>
														<li className="list-group-item border-none" style="padding: 0px;">
															<div className="padding-top-twenty clearfix">
																Navbar Icon
																<hr className="margin-top-ten margin-bottom-ten" />
																<div className="col-md-6 margin-top-ten">
																	<div className="row text-left">
																		<label className="text-light-grey small margin-left-five">Selected Icon</label>
																	</div>
																	<div className="row">
																		<div className="screens col-md-6 clearfix">
																			<div className="screen wideicon pull-left text-center" style="width: 100%;line-height: normal;height: 100%;">
																				<a className="border-radius-three default-background-hover" onClick={() => this.addImg('icon', null, this.props.index)}>
																					<span className="add-icon" style={this.props.data.iconUrl ? 'display: none' : null}>
																						+
																					</span>
																					{this.props.data.iconUrl ? <span className={`glyphicon ${this.props.data.iconUrl}`} /> : null}
																				</a>
																				<span
																					className="icon btn-delete-icon btn-danger transition-third ng-hide"
																					style={this.props.data.iconUrl ? 'pointer-events: all' : 'display: none;'}
																					onClick={() => {
																						this.addImg('icon', null, this.props.index, true);
																					}}
																				/>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</li>
													</ul>

													{/* <button className={`btn thumbnail page${this.props.index}color`} onClick={() => this.colorPicker('backgroundColor', this.props.index)} style={`${this.props.data.backgroundCSS}`}>
															<h5>{this.props.data.backgroundColor ? (this.props.data.backgroundColor.colorType != false ? `${this.props.data.backgroundColor.colorType}` : 'Add Background Color') : null}</h5>
														</button> */}

													{/* <button
														className="btn btn-danger"
														onClick={() => {
															this.colorPicker('backgroundColor', this.props.index, true);
														}}>
														Remove
													</button> */}
													{/* </div> */}
													{/* BG IMG */}

													{/* <div className="tab">
														<div>
															<h4 className="tag" style="width: 33%">
																Background Image:{' '}
															</h4>
															<a onClick={() => this.update(true, 'img')}>Apply to all</a>
														</div>
														<button className="btn thumbnail" style={this.props.data.backgroundImg ? `background: url("${this.props.data.backgroundImg}")` : `background: #33333`} onClick={() => this.addImg('background', null, this.props.index)}>
															<h5>{typeof this.state.backgroundImg === 'string' ? 'Change Background Image' : 'Add Background Image'}</h5>
														</button>
														<button
															className="btn btn-danger"
															onClick={() => {
																this.addImg('background', null, this.props.index, true);
															}}>
															Remove
														</button>
													</div> */}

													{/* NAV ICON */}

													{/* <div className="tab">
														<h4 className="tag" style="width: 33%">
															Navigation Icon:{' '}
														</h4>
														<button className="btn thumbnail" onClick={() => this.addImg('icon', null, this.props.index)}>
															<h5>{this.props.data.iconUrl ? <span className={`glyphicon ${this.props.data.iconUrl}`} /> : 'Add Icon'}</h5>
														</button>
														<button
															className="btn btn-danger"
															onClick={() => {
																this.addImg('icon', null, this.props.index, true);
															}}>
															Remove
														</button>
													</div> */}
													<button
														className="btn btn-success"
														style="float: right;"
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

									{/* ------ ADD NODES ------ */}
									<div className="col-sm-12">
										<div style="margin-bottom: 15px;">
											<h5 className="text-center">
												Add Elements
												<span style={'margin-left: 10px;'} className="glyphicon glyphicon-info-sign tooltip-custom">
													<div className="alert alert-info tooltip-info" style={'top: -80px; left: -28.5vw; width: 65vw;'}>
														You can add elements to this page by clicking on the buttons below. All elements appear in the list below. Click to edit, or drag to rearrange.
													</div>
												</span>
											</h5>
											<div className="btn-group tab" id={`menu${this.props.index}`}>
												<button
													title="Add a Header Element to this page."
													className="btn btn-default add tab-toggle "
													onClick={e => {
														this.addNode('header', this.props.index, () => this.openLast());
													}}>
													Add Header
												</button>
												<button
													title="Add a Text Element to this page."
													className="btn btn-default add tab-toggle"
													onClick={() => {
														this.addNode('desc', this.props.index, () => this.openLast());
													}}>
													Add Text
												</button>
												<button
													title="Add an Image Element to this page."
													className="btn btn-default add tab-toggle"
													onClick={() => {
														this.addNode('image', this.props.index, () => this.openLast());
													}}>
													Add Image
												</button>
												<button
													title="Add an Action Item to this page. Action items can link to other plugins, web content, and more."
													className="btn btn-default add tab-toggle"
													onClick={() => {
														// this.toggleModal(this.props.index, 'actions', 'show');
														this.addNode('action', this.props.index, () => this.openLast());
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
									{/* ------ HIDDEN NODELIST ------ */}
									<div className="col-sm-12">{this.renderNodes()}</div>

									<div title="This page's Elements appear here. Click the title to edit, or drag to reorder." className="col-sm-12" id={`nodelist${this.props.index}`} />

									<div className="tab modal-footer">
										<button
											className="btn btn-success"
											style="margin-left: 5px;"
											id={`tab${this.props.index}`}
											index={this.props.index}
											onClick={e => {
												// this.state.tutorials ? this.toggleTutorials('off') : null;
												// localStorage.setItem('tutorial', false);
												this.toggle(e);
											}}>
											<span className="glyphicon glyphicon-ok" />
											{'  '}
											Done
										</button>
										<button className="btn btn-primary" id={`page${this.props.index}optionsbutton`} index={`${this.props.index}`} onClick={e => this.toggle(e, 'options')}>
											{/* {document.getElementById(`page${this.props.index}options`) ? (document.getElementById(`page${this.props.index}options`).getAttribute('data-toggle') === 'hide' ? 'Options' : 'Done') : 'Options'} */}
											<span className="glyphicon glyphicon-wrench" />
											{'  '}
											Options
										</button>
										<button className="btn btn-danger" onClick={this.delete}>
											<span className="glyphicon glyphicon-alert" />
											{'  '}
											Remove Page
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
