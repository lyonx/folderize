import React, { Component } from "react";
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
    this.removeImg = this.removeImg.bind(this);
    this.renderImages = this.renderImages.bind(this);
    this.delete = this.delete.bind(this);
    this.addImg = this.addImg.bind(this);
    this.state = {
      title: props.data.title,
      plugins: props.data.plugins,
      header: props.data.header,
      desc: props.data.desc,
      images: props.data.images,
      nodes: [],
      show: false
    };
  }

  initSortable() {
    let selector = `#plugins${this.props.index}`;
    let plugins = new buildfire.components.pluginInstance.sortableList(
      selector,
      [],
      { showIcon: true, confirmDeleteItem: false },
      undefined,
      undefined,
      { itemEditable: true, navigationCallback: () => console.log("nav cb") }
    );
    let pluginNodes = this.state.nodes.filter(node => {
      return node.type === "plugin";
    });
    console.log(pluginNodes);
    // plugins.loadItems(pluginNodes, null);
    // this.state.plugins
    plugins.onAddItems = () => {
      let nodes = this.state.nodes;
      nodes.push({
        type: "plugin",
        data: plugins.items[plugins.items.length - 1]
      });
      this.setState({
        nodes: nodes
      });
      // this.update();
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

  delete() {
    this.deletePage(this.key);
  }

  update() {
    console.log(this.props.index);
    this.updatePage(this.props.index, {
      title: this.state.title,
      // plugins: this.state.plugins,
      // header: this.state.header,
      // desc: this.state.desc,
      images: this.state.images,
      nodes: this.state.nodes
    });
  }

  addImg(index) {
    let target = this.props.data.nodes[index];
    console.log(target);
    buildfire.imageLib.showDialog({}, (err, result) => {
      if (err) throw err;
      this.handleNodeChange(result.selectedFiles[0], index, "src");
      // let images = this.state.images;
      // result.selectedFiles.forEach(image => {
      //   images.push(image);
      // });
      // this.setState({ images });
      // this.update();
    });
  }

  removeImg(index) {
    let images = this.props.data.images;
    images.splice(index, 1);
    this.setState({ images: images });
    this.update();
  }

  renderImages() {
    let images = [];
    // console.log(this.props.data.images);
    this.props.data.images.forEach(image => {
      images.push(
        <ul className="list-group">
          <li className="list-group-item">
            <div className="row">
              <div className="col-xs-6 col-md-3">
                <a href="#" className="thumbnail">
                  <img src={image} alt="..." />
                </a>
              </div>
              <div className="col-xs-6 col-md-3">
                <button
                  className="btn btn-default"
                  onClick={() =>
                    this.removeImg(this.props.data.images.indexOf(image))
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        </ul>
      );
    });
    return images;
  }

  renderNodes() {
    let nodes = [];
    // console.log(this.props.data.nodes);
    this.props.data.nodes.forEach(node => {
      // console.warn(node);
      if (!node) return;
      switch (node.type) {
        case "header": {
          nodes.push(
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Header</h3>
              </div>
              <div className="panel-body">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    name="heading"
                    aria-describedby="sizing-addon2"
                    value={node.data.text}
                    onChange={e =>
                      this.handleNodeChange(
                        e,
                        this.props.data.nodes.indexOf(node),
                        "text"
                      )
                    }
                  />
                </div>
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.reorderNodes(this.props.data.nodes.indexOf(node), 0)
                  }
                >
                  Move Down
                </button>
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.reorderNodes(this.props.data.nodes.indexOf(node), 1)
                  }
                >
                  Move Up
                </button>
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.handleNodeChange(
                      e,
                      this.props.data.nodes.indexOf(node),
                      "delete"
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          );
          break;
        }
        case "desc": {
          nodes.push(
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Description</h3>
              </div>
              <div className="panel-body">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    name="desc"
                    aria-describedby="sizing-addon2"
                    value={node.data.text}
                    onChange={e =>
                      this.handleNodeChange(
                        e,
                        this.props.data.nodes.indexOf(node),
                        "text"
                      )
                    }
                  />
                </div>
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.reorderNodes(this.props.data.nodes.indexOf(node), 0)
                  }
                >
                  Move Down
                </button>
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.reorderNodes(this.props.data.nodes.indexOf(node), 1)
                  }
                >
                  Move Up
                </button>
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.handleNodeChange(
                      e,
                      this.props.data.nodes.indexOf(node),
                      "delete"
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          );
          break;
        }
        case "image": {
          nodes.push(
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Image</h3>
              </div>
              <div className="panel-body">
                <button
                  className="btn btn-deafult"
                  onClick={() =>
                    this.addImg(this.props.data.nodes.indexOf(node))
                  }
                >
                  Change Image
                </button>
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.reorderNodes(this.props.data.nodes.indexOf(node), 0)
                  }
                >
                  Move Down
                </button>
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.reorderNodes(this.props.data.nodes.indexOf(node), 1)
                  }
                >
                  Move Up
                </button>
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.handleNodeChange(
                      e,
                      this.props.data.nodes.indexOf(node),
                      "delete"
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          );
          break;
        }
        case "plugin": {
          nodes.push(
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Plugin</h3>
              </div>
              <div className="panel-body">
                <div className="plugin">
                  <div
                    className="plugin-thumbnail"
                    style={`background: url("${node.data.iconUrl}")`}
                    alt="..."
                  />
                  <h2 className="plugin-title">{node.data.title}</h2>
                </div>
                <button onClick={e => this.pluginNav(node)}>Go</button>
                <hr />
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.reorderNodes(this.props.data.nodes.indexOf(node), 0)
                  }
                >
                  Move Down
                </button>
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.reorderNodes(this.props.data.nodes.indexOf(node), 1)
                  }
                >
                  Move Up
                </button>
                <button
                  className="btn btn-deafult"
                  onClick={e =>
                    this.handleNodeChange(
                      e,
                      this.props.data.nodes.indexOf(node),
                      "delete"
                    )
                  }
                >
                  Remove
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

  handleNodeChange(event, index, attr) {
    console.log(event, index, attr);
    let nodes = this.props.data.nodes;
    let node = this.props.data.nodes[index];
    switch (attr) {
      case "text": {
        node.data.text = event.target.value;
        nodes[index] = node;
        this.setState({ nodes });
        break;
      }
      case "src": {
        console.log(node.data.src, event);
        node.data.src = event;
        nodes[index] = node;
        this.setState({ nodes });
        this.update();
        break;
      }
      case "delete": {
        nodes.splice(index, 1);
        this.setState({ nodes });
        this.update();
        break;
      }
      default:
        return;
    }
  }

  addNode(type) {
    let nodes = this.props.data.nodes;
    switch (type) {
      case "header": {
        nodes.push({
          type: "header",
          data: {
            text: "new page"
          }
        });
        this.setState({ nodes });
        break;
      }
      case "desc": {
        nodes.push({
          type: "desc",
          data: {
            text: "You can edit this description in the control."
          }
        });
        this.setState({ nodes });
        break;
      }
      case "image": {
        nodes.push({
          type: "image",
          data: {
            src:
              "https://images.unsplash.com/photo-1519636243899-5544aa477f70?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjQ0MDV9&s=6c937b3dbd83210ac77d8c591265cdf8"
          }
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
    console.log(nodes, index, dir);
    // let target = nodes[index];

    if (dir === 1) {
      let temp = nodes[index - 1];
      if (!temp) return;
      nodes[index - 1] = nodes[index];
      nodes[index] = temp;
      console.log(nodes);
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
    console.log("handlechange");
    const target = event.target;
    const name = target.name;
    this.setState({ [name]: event.target.value });
  }

  toggle(e) {
    let panel = document.getElementById(
      `panel${document.getElementById(e.target.id).getAttribute("index")}`
    );
    // console.log(panel.getAttribute("data-toggle"));
    switch (panel.getAttribute("data-toggle")) {
      case "show":
        panel.classList.remove("panel-show");
        panel.classList.add("panel-hide");
        panel.setAttribute("data-toggle", "hide");
        break;
      case "hide":
        panel.classList.remove("panel-hide");
        panel.classList.add("panel-show");
        panel.setAttribute("data-toggle", "show");
        break;
      default:
        break;
    }
  }

  componentDidMount() {
    // console.table(this.props);
    this.setState({
      title: this.props.data.title,
      nodes: this.props.data.nodes
    });
    this.initSortable();
  }

  componentDidUpdate() {
    console.log(this.state);
  }

  render() {
    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-heading tab">
            <h3 className="panel-title tab-title">{this.state.title}</h3>
            <div className="toggle-group">
              <button
                className="btn btn-default tab-toggle"
                onClick={e => this.reorderPages(this.props.index, 1)}
              >
                Move Up
              </button>
              <button
                className="btn btn-default tab-toggle"
                onClick={e => this.reorderPages(this.props.index, 0)}
              >
                Move Down
              </button>
              <button
                className="btn btn-default tab-toggle"
                id={`tab${this.props.index}`}
                index={this.props.index}
                onClick={e => this.toggle(e)}
              >
                Edit
              </button>
            </div>
          </div>
          <div
            className="panel-body panel-hide"
            data-toggle="hide"
            id={`panel${this.props.index}`}
          >
            <div className="container">
              <div className="row">
                <div className="col-sm-12">
                  <div id={`plugins${this.props.index}`} />
                </div>
              </div>

              <div className="row">
                <div className="col-sm-12">
                  <form>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        aria-describedby="sizing-addon2"
                        value={this.state.title}
                        onChange={this.handleChange}
                      />
                    </div>
                  </form>
                </div>
                <div className="col-sm-12">
                  <button
                    className="btn btn-default"
                    onClick={() => this.addNode("header")}
                  >
                    Add Header
                  </button>
                  <button
                    className="btn btn-default"
                    onClick={() => this.addNode("desc")}
                  >
                    Add Description
                  </button>
                  <button
                    className="btn btn-default"
                    onClick={() => this.addNode("image")}
                  >
                    Add Image
                  </button>
                </div>
                <div className="col-sm-12">{this.renderNodes()}</div>
                <div className="col-sm-12">{this.renderImages()}</div>
                <div className="col-sm-12">
                  <div id={`plugins${this.key}`} />
                  <button className="btn btn-primary" onClick={this.delete}>
                    Delete Page
                  </button>
                  <button className="btn btn-primary" onClick={this.update}>
                    Update
                  </button>
                  <button className="btn btn-primary" onClick={this.addImg}>
                    Add Image
                  </button>
                  <button className="btn btn-primary" onClick={this.addImg}>
                    Add Plugin
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
