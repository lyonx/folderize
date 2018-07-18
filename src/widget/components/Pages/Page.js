import React, { Component } from "react";

class Page extends Component {
  renderPlugins() {
    let plugins = [];
    // console.log(this.props);
    this.props.data.plugins.forEach(plugin => {
      plugins.push(
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">{plugin.title}</h3>
          </div>
          <div className="panel-body plugin-panel">
            <div
              className="thumbnail"
              style={`background: url(${plugin.iconUrl}`}
            />
            {/* <div className="plugin-content">
              There will be some content here.
            </div> */}
          </div>
        </div>
      );
    });
    return plugins;
  }

  renderImages() {
    let images = [];
    this.props.data.images.forEach(image => {
      images.push(
        <div className="image-wrap">
          <div className="images" style={`background: url(${image})`} />
        </div>
      );
    });
    // console.log(images);
    return images;
  }

  render() {
    return (
      <li className="js_slide">
        <div className="container-fluid page-content">
          <div className="row">
            <div className="col-sm-12">
              <div className="page-header">
                <h1>{this.props.data.header}</h1>
              </div>
            </div>
            <div className="col-sm-12">
              <p>{this.props.data.desc}</p>
            </div>
            <div className="col-sm-12">{this.renderImages()}</div>
            <ul className="list-group">
              <div className="col-sm-12">{this.renderPlugins()}</div>
            </ul>
          </div>
        </div>
      </li>
    );
  }
}

export default Page;
