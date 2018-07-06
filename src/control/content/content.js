import React, { Component } from "react";
import { log } from "util";

class Content extends Component {
  addPlugin(instance) {
    console.log("instances", instance);
    buildfire.datastore.insert(instance, "plugin", (err, res) => {
      if (err) console.log(err);
      console.log(res);
    });
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
    //   console.log(result);
    console.log(plugins);
    plugins.forEach(plugin => {
      buildfire.pluginInstance.get(plugin.instanceId, (err, inst) => {
        if (err) throw err;
        console.log(inst);
        this.addPlugin(inst);
      });
    });
    // });
  }

  showPluginDialog() {
    buildfire.pluginInstance.showDialog({}, (err, instances) => {
      if (err) throw err;
      console.log(instances);
      if (instances.length > 0) {
        this.prepPlugins(instances);
      } else return;
    });
  }

  clearData() {
    buildfire.datastore.search({}, "plugin", (err, data) => {
      console.log(data);
      data.forEach(instance => {
        console.log(instance);
        buildfire.datastore.delete(instance.id, "plugin", (err, result) => {
          if (err) throw err;
          console.log(result);
        });
      });
    });
  }

  logData() {
    buildfire.datastore.search({}, (err, result) => {
      if (err) throw err;
      console.log(result);
    });
  }

  initCarousel() {
    var editor = new buildfire.components.carousel.editor("#carousel");
    /// handle the loading
    function loadItems(carouselItems) {
      // create an instance and pass it the items if you don't have items yet just pass []
      editor.loadItems(carouselItems);
    }
    /// call buildfire datastore to see if there are any previously saved items
    buildfire.datastore.get(function(err, obj) {
      if (err) alert("error");
      else loadItems(obj.data.carouselItems);
    });
    /// save any changes in items
    function save(items) {
      console.log("saving...");
      buildfire.datastore.save({ carouselItems: items }, function(e) {
        if (e) alert("error");
        else console.log("saved.");
      });
    }
    // this method will be called when a new item added to the list
    editor.onAddItems = function(items) {
      save(editor.items);
    };
    // this method will be called when an item deleted from the list
    editor.onDeleteItem = function(item, index) {
      save(editor.items);
    };
    // this method will be called when you edit item details
    editor.onItemChange = function(item) {
      save(editor.items);
    };
    // this method will be called when you change the order of items
    editor.onOrderChange = function(item, oldIndex, newIndex) {
      save(editor.items);
    };
  }

  searchImgs() {
    e => {
      e.preventDefault();
      buildfire.datastore.search({}, "img", (err, res) => {
        if (err) console.log(err);
        console.log(res);
      });
    };
  }

  componentDidMount() {
    this.initCarousel();
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
        <button className="btn btn-default" onClick={this.logData}>
          Log Data
        </button>
        <button className="btn btn-default" onClick={this.clearData}>
          Clear Data
        </button>
        <div id="carousel" />
        <button onClick={this.searchImgs}>Search</button>
      </div>
    );
  }
}

export default Content;
