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
      backgroundImg: this.props.backgroundImg
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
      backgroundImg: this.state.backgroundImg
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
        node.data.src = event;
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
      default:
        return;
    }
  }

  renderNodes() {
    let nodes = [];
    console.warn(this.props);
    
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
                    Edit
                  </button>
                </div>
              </div>
              <div className="panel-body panel-hide" data-toggle="hide" id={`page${this.props.index}nodepanel${index}`}>
                <div className="input-group">
                  <input type="text" className="form-control" name="heading" aria-describedby="sizing-addon2" value={node.data.text} onChange={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'text')} />
                </div>
                <button className="btn btn-danger" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete')}>
                  Remove
                </button>
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
                    Edit
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
                <button className="btn btn-danger" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete')}>
                  Remove
                </button>
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
                    Edit
                  </button>
                </div>
              </div>
              <div className="panel-body panel-hide" data-toggle="hide" id={`page${this.props.index}nodepanel${index}`}>
                <button className="btn btn-danger" onClick={e => this.handleNodeChange(e, this.props.data.nodes.indexOf(node), 'delete')}>
                  Remove
                </button>
                <button className="btn btn-success" onClick={() => this.addImg('node', this.props.data.nodes.indexOf(node))}>
                  Change Image
                </button>
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
                <h3 className="panel-title tab-title">Plugin</h3>
                <div className="toggle-group">
                  <button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 1)}>
                    <span className="glyphicon glyphicon-chevron-up" aria-hidden="true" />
                  </button>
                  <button className="btn btn-deafult tab-toggle" onClick={e => this.reorderNodes(index, 0)}>
                    <span className="glyphicon glyphicon-chevron-down" aria-hidden="true" />
                  </button>
                  <button className="btn btn-deafult tab-toggle" id={`node${index}`} index={`${index}`} onClick={e => this.toggle(e, 'node')}>
                    Edit
                  </button>
                </div>
              </div>
              <div className="panel-body panel-hide" id={`page${this.props.index}nodepanel${index}`} data-toggle="hide">
                <div className="plugin">
                  <div className="plugin-thumbnail" style={`background: url("${node.data.iconUrl}")`} alt="..." />
                  <h3 className="plugin-title">{node.data.title}</h3>
                </div>
                <hr />
                <button className="btn btn-deafult" onClick={e => this.handleNodeChange(e, index, 'delete')}>
                  Remove
                </button>
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
                    Edit
                  </button>
                </div>
              </div>
              <div className="panel-body panel-hide" id={`page${this.props.index}nodepanel${index}`} data-toggle="hide">
                <div className="action">
                  <div className="plugin-thumbnail" style={`background: url("${node.data.iconUrl}")`} alt="..." />
                  <h3 className="plugin-title">{node.data.title}</h3>
                </div>
                <hr />
                <button className="btn btn-danger" onClick={e => this.handleNodeChange(e, index, 'delete')}>
                  Remove
                </button>
                <button
                  className="btn btn-success"
                  onClick={e => {
                    console.log(node);
                    buildfire.actionItems.showDialog(node.data, {}, (err, res) => {
                      if (err) throw err;
                      node.data = res;
                      this.update();
                    });
                  }}>
                  Edit
                </button>
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
    if (e.target.innerHTML === 'Edit') {
      e.target.innerHTML = 'Hide';
    } else if (e.target.innerHTML === 'Hide') {
      e.target.innerHTML = 'Edit';
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
      backgroundImg: this.props.data.backgroundImg
    });
    this.initSortable();
    this.initActionItems();
  }

  componentDidUpdate() {
    // console.warn(this.state);
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
          <div className="panel-body panel-hide" data-toggle="hide" id={`panel${this.props.index}`}>
            <div className="container">
              <div className="row">
                <div className="col-sm-12">
                  <div className="panel panel-default">
                    <div className="panel-heading tab">
                      <h3 className="panel-title tab-title">Page Config</h3>
                      <div className="toggle-group">
                        <button className="btn btn-deafult tab-toggle" id={`page${this.props.index}optionsbutton`} index={`${this.props.index}`} onClick={e => this.toggle(e, 'options')}>
                          Edit
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
                        <button className="btn btn-danger" style="margin-left: 15px" onClick={() => {
                          this.setState({ backgroundColor: { colorType: false, solid: {backgroundCSS: ""}, gradient: {backgroundCSS: ""}} });
                        }}>
                          X
                        </button>
                      </div>
                      <br />
                      <div className="tab">
                        <button className="btn btn-success tab-toggle" onClick={() => this.addImg('background')}>
                          Add Background Image
                        </button>
                        <button className="btn btn-danger" style="margin-left: 15px" onClick={() => {
                          this.setState({ backgroundImg: {}});
                          this.update();
                        }}>
                          X
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-12">
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-default dropdown-toggle"
                      aria-haspopup="true"
                      aria-expanded="false"
                      id={`dropdown${this.props.index}`}
                      index={this.props.index}
                      onClick={e => {
                        let index = document.getElementById(e.target.id).getAttribute('index');
                        let menu = document.getElementById(`menu${index}`);
                        let toggle = menu.getAttribute('data-toggle');
                        if (toggle === 'show') {
                          menu.classList.replace('panel-show', 'panel-hide');
                          menu.setAttribute('data-toggle', 'hide');
                        } else {
                          menu.classList.replace('panel-hide', 'panel-show');
                          menu.setAttribute('data-toggle', 'show');
                        }
                      }}>
                      Add Nodes
                      <span className="caret" style="pointer-events: none;" />
                    </button>
                    <ul className="dropdown-menu panel-hide" data-toggle="hide" id={`menu${this.props.index}`}>
                      <li>
                        <a
                          onClick={e => {
                            this.addNode('header');
                            document.getElementById(`menu${this.props.index}`).classList.replace('panel-show', 'panel-hide');
                            document.getElementById(`menu${this.props.index}`).setAttribute('data-toggle', 'hide');
                          }}>
                          Add Header
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => {
                            document.getElementById(`menu${this.props.index}`).classList.replace('panel-show', 'panel-hide');
                            document.getElementById(`menu${this.props.index}`).setAttribute('data-toggle', 'hide');
                            this.addNode('desc');
                          }}>
                          Add Description
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => {
                            document.getElementById(`menu${this.props.index}`).classList.replace('panel-show', 'panel-hide');
                            document.getElementById(`menu${this.props.index}`).setAttribute('data-toggle', 'hide');
                            this.addNode('image');
                          }}>
                          Add Image
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => {
                            document.getElementById(`menu${this.props.index}`).classList.replace('panel-show', 'panel-hide');
                            document.getElementById(`menu${this.props.index}`).setAttribute('data-toggle', 'hide');
                            this.toggleModal(this.props.index, 'plugins', 'show');
                          }}>
                          Add Plugin
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => {
                            document.getElementById(`menu${this.props.index}`).classList.replace('panel-show', 'panel-hide');
                            document.getElementById(`menu${this.props.index}`).setAttribute('data-toggle', 'hide');
                            this.toggleModal(this.props.index, 'actions', 'show');
                          }}>
                          Add Action Item
                        </a>
                      </li>
                    </ul>
                  </div>
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
                <div className="col-sm-12">{this.renderNodes()}</div>
                <div className="col-sm-12">
                  <button className="btn btn-danger" onClick={this.delete}>
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
