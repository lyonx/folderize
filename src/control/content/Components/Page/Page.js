import React, { Component } from "react";
let db = buildfire.datastore;

class Page extends Component {
  constructor(props) {
    super(props);
    this.updatePage = props.updatePage;
    this.deletePage = props.deletePage;
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
      images: props.data.images
    };
  }

  initSortable() {
    let selector = `#plugins${this.key}`;
    let plugins = new buildfire.components.pluginInstance.sortableList(
      selector,
      [],
      { showIcon: true, confirmDeleteItem: false },
      undefined,
      undefined,
      { itemEditable: true, navigationCallback: () => console.log("nav cb") }
    );
    plugins.loadItems(this.state.plugins);
    plugins.onAddItems = () => {
      this.setState({
        plugins: plugins.items
      });
      this.update();
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
    console.log(this);
    this.updatePage(this.key, {
      title: this.state.title,
      plugins: this.state.plugins,
      header: this.state.header,
      desc: this.state.desc,
      images: this.state.images
    });
  }

  addImg() {
    buildfire.imageLib.showDialog({}, (err, result) => {
      if (err) throw err;
      let images = this.state.images;
      result.selectedFiles.forEach(image => {
        images.push(image);
      });
      this.setState({ images });
      this.update();
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
                <button className="btn btn-default" onClick={() => this.removeImg(this.props.data.images.indexOf(image))}>Remove</button>
              </div>
            </div>
          </li>
        </ul>
      );
    });
    return images;
  }

  handleChange(event) {
    console.log("handlechange");
    const target = event.target;
    const name = target.name;
    this.setState({ [name]: event.target.value });
  }

  componentDidMount() {
    this.initSortable();
  }

  componentDidUpdate() {
    // console.log(this.state);
  }

  render() {
    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">{this.props.data.title}</h3>
          </div>
          <div className="panel-body">
            <div className="container">
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
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        name="header"
                        aria-describedby="sizing-addon2"
                        value={this.state.header}
                        onChange={this.handleChange}
                      />
                    </div>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        name="desc"
                        aria-describedby="sizing-addon2"
                        value={this.state.desc}
                        onChange={this.handleChange}
                      />
                    </div>
                  </form>
                </div>
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
