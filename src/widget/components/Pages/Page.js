import React, { Component } from "react";
// Widget Side Page
class Page extends Component {

  renderPlugins() {
    let plugins = [];
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
          </div>
        </div>
      );
    });
    return plugins;
  }

  pluginNav(node) {
    buildfire.navigation.navigateTo({
      pluginId: node.data.pluginTypeId,
      instanceId: node.data.instanceId,
      folderName: node.data._buildfire.pluginType.result[0].folderName,
      title: node.data.title
    });
  }

  renderNodes() {
    let nodes = [];
    if (!this.props.data.nodes) return;
    this.props.data.nodes.forEach(node => {
      if (!node) return;
      switch (node.type) {
        case "header": {
          nodes.push(
            <div className="col-sm-12">
              <div className="page-header">
                <h1>{node.data.text}</h1>
              </div>
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
          if (!node.data) return;
          nodes.push(
            <div className="col-sm-12">
              <div className="plugin" onClick={e => this.pluginNav(node)}>
                <div
                  className="plugin-thumbnail"
                  style={`background: url("${node.data.iconUrl}")`}
                  alt="..."
                />
                <h3 className="plugin-title">{node.data.title}</h3>
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
      <li className="js_slide" index={this.props.index}>
        <div className="container-fluid page-content">
          <div className="row">{this.renderNodes()}</div>
        </div>
      </li>
    );
  }
}

export default Page;
