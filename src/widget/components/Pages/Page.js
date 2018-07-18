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

  pluginNav(node) {
    console.log(node);
    buildfire.navigation.navigateTo({
      pluginId: node.pluginTypeId,
      instanceId: node.instanceId,
      folderName: null,
      title: node.title
    });
  }

  renderNodes() {
    // console.log(this.props.data.nodes);
    let nodes = [];
    this.props.data.nodes.forEach(node => {
      if (!node) return;
      switch (node.type) {
        case "header": {
          nodes.push(
            <div className="col-sm-12">
              <div className="page-header">
                <h1>{node.data.text}</h1>
              </div>
              <hr />
            </div>
          );
          break;
        }
        case "desc": {
          nodes.push(
            <div className="col-sm-12">
              <p className="description">{node.data.text}</p>
            </div>
          );
          break;
        }
        case "image": {
          nodes.push(
            <div className="col-sm-12">
              <div className="image-wrap">
                <div
                  className="images"
                  style={`background: url(${node.data.src})`}
                />
              </div>
            </div>
          );
          break;
        }
        case "plugin": {
          nodes.push(
            <div className="col-sm-12">
              <div className="plugin" onClick={e => this.pluginNav(node)}>
                <div
                  className="plugin-thumbnail"
                  style={`background: url("${node.data.iconUrl}")`}
                  alt="..."
                >
                  <h3 className="plugin-title">{node.data.title}</h3>
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
      <li className="js_slide">
        <div className="container-fluid page-content">
          <div className="row">{this.renderNodes()}</div>
        </div>
      </li>
    );
  }
}

export default Page;
