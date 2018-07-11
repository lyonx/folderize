import React, { Component } from "react";

let buildfire = window.buildfire;
let tinymce = window.tinymce;

class Content extends Component {
  constructor(props) {
    super(props);
    this.logData = this.logData.bind(this);
    this.state = {
      plugins: []
    };
  }

  addPlugin(instance) {
    buildfire.datastore.insert(instance, "plugin", (err, res) => {
      if (err) throw err;
    });
  }

  datastoreListener() {
    buildfire.datastore.onUpdate(snapshot => {
      console.info("update return: ", snapshot);
      this.datastoreFetch();
    });
  }

  datastoreFetch() {
    buildfire.datastore.search({}, "plugin", (err, result) => {
      if (err) throw err;
      console.dir(result);
      this.setState({
        plugins: []
      });
      let temp = this.state.plugins;
      result.forEach(plugin => temp.push(plugin));
      this.setState({
        plugins: temp
      });
      this.renderPlugins();
    });
  }

  renderPlugins() {}

  prepPlugins(plugins) {
    console.log(plugins);
    plugins.forEach(plugin => {
      buildfire.pluginInstance.get(plugin.instanceId, (err, inst) => {
        if (err) throw err;
        this.addPlugin(inst);
      });
    });
    // });
  }

  showPluginDialog() {
    // buildfire.pluginInstance.showDialog({}, (err, instances) => {
    //   if (err) throw err;
    //   if (!instances) return;
    //   if (instances.length > 0) {
    //     this.prepPlugins(instances);
    //   } else return;
    // });
  }

  clearData() {
    // buildfire.datastore.search({}, "text", (err, res) => {
    //   res.forEach(instance => {
    //     buildfire.datastore.delete(instance.id, "text", (err, result) => {
    //       if (err) throw err;
    //       console.log(result);
    //     });
    //   });
    // });
    buildfire.datastore.search({}, "plugin", (err, res) => {
      res.forEach(instance => {
        buildfire.datastore.delete(instance.id, "plugin", (err, result) => {
          if (err) throw err;
          console.log(result);
        });
      });
    });
    // buildfire.datastore.search({}, "img", (err, res) => {
    //   res.forEach(instance => {
    //     buildfire.datastore.delete(instance.id, "img", (err, result) => {
    //       if (err) throw err;
    //       console.log(result);
    //     });
    //   });
    // });
    // buildfire.datastore.search({}, "heroColor", (err, res) => {
    //   res.forEach(instance => {
    //     buildfire.datastore.delete(instance.id, "heroColor", (err, result) => {
    //       if (err) throw err;
    //       console.log(result);
    //     });
    //   });
    // });
  }

  logData() {
    // buildfire.datastore.search({}, "img", (err, res) => {
    //   if (err) throw err;
    //   console.log(res);
    // });
    buildfire.datastore.search({}, "plugin", (err, res) => {
      if (err) throw err;
      console.log(res);
    });
    // buildfire.datastore.search({}, "heroColor", (err, res) => {
    //   if (err) throw err;
    //   console.log(res);
    // });
    // buildfire.datastore.search({}, (err, res) => {
    //   if (err) throw err;
    //   console.log(res);
    // });
  }

  addImg() {
    buildfire.imageLib.showDialog({}, (err, result) => {
      if (err) throw err;
      buildfire.datastore.search({}, "img", (err, res) => {
        if (err) throw err;
        if (res[0]) {
          buildfire.datastore.delete(res[0].id, "img", (err, status) => {
            if (err) throw err;
          });
        }
        buildfire.datastore.insert(result.selectedFiles, "img", (err, res) => {
          if (err) throw err;
        });
      });
    });
  }

  colorPicker(target) {
    switch (target) {
      case "hero": {
        buildfire.colorLib.showDialog(
          { colorType: "solid" },
          { hideGradient: true },
          (err, res) => {
            if (err) throw err;
          },
          (err, data) => {
            if (err) throw err;
            if (data.colorType === "solid") {
              buildfire.datastore.search({}, "heroColor", (err, res) => {
                if (err) throw err;
                if (res[0]) {
                  buildfire.datastore.delete(
                    res[0].id,
                    "heroColor",
                    (err, status) => {
                      if (err) throw err;
                    }
                  );
                }
                buildfire.datastore.insert(
                  { color: data.solid },
                  "heroColor",
                  (err, res) => {
                    if (err) throw err;
                  }
                );
              });
            }
          }
        );
      }
    }
  }

  mceInit() {
    tinymce.init({
      selector: "textarea",
      init_instance_callback: editor => {
        editor.on("Change", e => {
          let text = tinymce.activeEditor.getContent();
          buildfire.datastore.search({}, "text", (err, res) => {
            if (err) throw err;
            if (res[0]) {
              buildfire.datastore.delete(res[0].id, "text", (err, status) => {
                if (err) throw err;
              });
            }
            buildfire.datastore.insert({ text }, "text", (err, res) => {
              if (err) throw err;
            });
          });
        });
      }
    });
  }

  componentDidMount() {
    this.datastoreFetch();
    this.datastoreListener();
    let plugins = new buildfire.components.pluginInstance.sortableList(
      "#plugins",
      [],
      { showIcon: true, confirmDeleteItem: false },
      undefined,
      undefined,
      { itemEditable: true, navigationCallback: () => console.log("nav cb") }
    );
    // let getPluginsIds = (plugins) => {
    //   var pluginsIds = [];
    //   for (var i = 0; i < plugins.length; i++) {
    //     pluginsIds.push(plugins[i].instanceId);
    //   }
    //   return pluginsIds;
    // };
    plugins.onAddItems = () => {
      buildfire.datastore.search({}, "plugin", (err, res) => {
        res.forEach(instance => {
          buildfire.datastore.delete(instance.id, "plugin", (err, result) => {
            if (err) throw err;
            console.log(result);
          });
        });
      });
      let items = plugins.items;
      console.log(items);
      this.prepPlugins(items);
    };
  }

  componentDidUpdate() {
    this.mceInit();
  }

  render() {
    return (
      <div>
        <textarea name="content" />
        <div>
          <ol id="plugins" />
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
          <button onClick={() => console.log(this.state)}>State</button>
          <div id="plugins-carousel" />
          <button onClick={() => this.colorPicker("hero")}>
            Change Hero Text Color
          </button>
        </div>
      </div>
    );
  }
}

export default Content;
