import React, { Component } from "react";
import { log } from "util";

class Content extends Component {
  constructor(props) {
    super(props);
    this.logData = this.logData.bind(this);
    this.state = {};
  }

  addPlugin(instance) {
    buildfire.datastore.insert(instance, "plugin", (err, res) => {
      if (err) console.log(err);
      console.log(res);
    });
    // this.updateCarousel();
  }

  getPluginDetails(pluginsInfo, pluginIds) {
    var returnPlugins = [];
    var tempPlugin = null;
    // for every plugin id
    for (var id = 0; id < pluginIds.length; id++) {
      // for each id
      for (var i = 0; i < pluginsInfo.length; i++) {
        tempPlugin = {};
        if (pluginIds[id] == pluginsInfo[i].data.instanceId) {
          tempPlugin.instanceId = pluginsInfo[i].data.instanceId;
          if (pluginsInfo[i].data) {
            tempPlugin.iconUrl = pluginsInfo[i].data.iconUrl;
            tempPlugin.iconClassName = pluginsInfo[i].data.iconClassName;
            tempPlugin.title = pluginsInfo[i].data.title;
            tempPlugin.pluginTypeId = pluginsInfo[i].data.pluginType.token;
            tempPlugin.folderName = pluginsInfo[i].data.pluginType.folderName;
          } else {
            tempPlugin.iconUrl = "";
            tempPlugin.title = "[No title]";
          }
          returnPlugins.push(tempPlugin);
        }
        tempPlugin = null;
      }
    }
    return returnPlugins;
  }

  prepPlugins(plugins) {
    // buildfire.datastore.search({}, "plugin", (err, result) => {
    //   if (err) throw err;
    plugins.forEach(plugin => {
      buildfire.pluginInstance.get(plugin.instanceId, (err, inst) => {
        if (err) throw err;
        this.addPlugin(inst);
      });
    });
    // });
  }

  showPluginDialog() {
    buildfire.pluginInstance.showDialog({}, (err, instances) => {
      if (err) throw err;
      if (instances.length > 0) {
        this.prepPlugins(instances);
      } else return;
    });
  }

  clearData() {
    // buildfire.datastore.search({}, "plugin", (err, data) => {
    //   data.forEach(instance => {
    //     buildfire.datastore.delete(instance.id, "plugin", (err, result) => {
    //       if (err) throw err;
    //       console.log(result);
    //     });
    //   });
    // });
    buildfire.datastore.search({}, "plugin", (err, res) => {
      console.log(err, res);
      res.forEach(instance => {
        console.log(instance.id);
        buildfire.datastore.delete(instance.id, "plugin", (err, result) => {
          if (err) throw err;
          console.log(result);
        });
      });
    });
    buildfire.datastore.search({}, "img", (err, res) => {
      console.log(err, res);
      res.forEach(instance => {
        console.log(instance.id);
        buildfire.datastore.delete(instance.id, "img", (err, result) => {
          if (err) throw err;
          console.log(result);
        });
      });
    });
  }

  logData() {
    buildfire.datastore.search({}, "img", (err, res) => {
      if (err) console.log(err);
      console.log(res);
    });
    buildfire.datastore.search({}, "plugin", (err, res) => {
      if (err) console.log(err);
      console.log(res);
    });
    buildfire.datastore.search({}, (err, res) => {
      if (err) console.log(err);
      console.log(res);
    });
  }

  addImg() {
    buildfire.imageLib.showDialog({}, (err, result) => {
      if (err) console.log(err);
      console.log(result);
      buildfire.datastore.search({}, "img", (err, res) => {
        if (err) console.log(err);
        console.log(res);
        if (res[0]) {
          console.log(res);
          buildfire.datastore.delete(res[0].id, "img", (err, status) => {
            if (err) console.log(err);
            console.log(status);
          });
        }
        buildfire.datastore.insert(result.selectedFiles, "img", (err, res) => {
          if (err) console.log(err);
          console.log(res);
        });
      });
    });
  }

  searchImgs() {
    e => {
      e.preventDefault();
      console.log("test");
    };
  }

  componentDidMount() {
    // this.initCarousel();
    // this.initPluginCarousel();
  }

  render() {
    return (
      <div>
        <button
          className="btn btn-default"
          onClick={this.showPluginDialog.bind(this)}
        >
          Add Plugin
        </button>
        <button className="btn btn-default" onClick={this.addImg}>
          Add Image
        </button>
        <button className="btn btn-default" onClick={this.logData}>
          Log Data
        </button>
        <button className="btn btn-default" onClick={this.clearData}>
          Clear Data
        </button>
        <div id="carousel" />
        <div id="plugins-carousel" />
        <button onClick={this.searchImgs}>Search</button>
      </div>
    );
  }
}

export default Content;
