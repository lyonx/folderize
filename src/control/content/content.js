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
    });
  }

  prepPlugins(plugins) {
    console.log(plugins);
    let temp = [];
    plugins.forEach(plugin => {
      buildfire.pluginInstance.get(plugin.instanceId, (err, inst) => {
        if (err) throw err;
        this.addPlugin(inst);
      });
    });
    // });
  }

  clearData() {
    buildfire.datastore.search({}, "text", (err, res) => {
      if (err) throw err;
      res.forEach(instance => {
        buildfire.datastore.delete(instance.id, "text", (err, result) => {
          if (err) throw err;
          console.log(result);
        });
      });
    });
    buildfire.datastore.search({}, "plugins", (err, res) => {
      if (err) throw err;
      res.forEach(instance => {
        buildfire.datastore.delete(instance.id, "plugins", (err, result) => {
          if (err) throw err;
          console.log(result);
        });
      });
    });
    buildfire.datastore.search({}, "img", (err, res) => {
      res.forEach(instance => {
        buildfire.datastore.delete(instance.id, "img", (err, result) => {
          if (err) throw err;
          console.log(result);
        });
      });
    });
    buildfire.datastore.search({}, "heroColor", (err, res) => {
      res.forEach(instance => {
        buildfire.datastore.delete(instance.id, "heroColor", (err, result) => {
          if (err) throw err;
          console.log(result);
        });
      });
    });
  }

  logData() {
    buildfire.datastore.search({}, "text", (err, res) => {
      if (err) throw err;
      console.log("text", res);
    });
    buildfire.datastore.search({}, "img", (err, res) => {
      if (err) throw err;
      console.log("img", res);
    });
    buildfire.datastore.search({}, "plugins", (err, res) => {
      if (err) throw err;
      console.log("plugins: ", res);
    });
    // buildfire.datastore.search({}, "heroColor", (err, res) => {
    //   if (err) throw err;
    //   console.log("color", res);
    // });
    // buildfire.datastore.search({}, (err, res) => {
    //   if (err) throw err;
    //   console.log("all", res);
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
                      console.log(status);
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
            console.log(res);
            if (res[0]) {
              buildfire.datastore.delete(res[0].id, "text", (err, status) => {
                if (err) throw err;
                console.log(status);
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

  initSortable() {
    let plugins = new buildfire.components.pluginInstance.sortableList(
      "#plugins",
      [],
      { showIcon: true, confirmDeleteItem: false },
      undefined,
      undefined,
      { itemEditable: true, navigationCallback: () => console.log("nav cb") }
    );

    buildfire.datastore.get("plugins", (err, result) => {
      if (err) throw err;
      console.log(result);
      if (result.length === 0) return;
      plugins.loadItems(result.data.plugins, null);
    });

    plugins.onAddItems = () => {
      console.log(plugins.items);
      buildfire.datastore.save(
        // {},
        { plugins: plugins.items },
        "plugins",
        (err, res) => {
          if (err) throw err;
          console.log(res);
        }
      );
    };

    plugins.onDeleteItem = () => {
      console.log(plugins);
      buildfire.datastore.save(
        // {},
        { plugins: plugins.items },
        "plugins",
        (err, res) => {
          if (err) throw err;
          console.log(res);
        }
      );
    };

    plugins.onOrderChange = () => {
      buildfire.datastore.save(
        // {},
        { plugins: plugins.items },
        "plugins",
        (err, res) => {
          if (err) throw err;
          console.log(res);
        }
      );
    };
  }

  toggleHero(checked) {
    if (checked) {
      let intro = document.getElementById("intro");
      intro.setAttribute("style", "display: initial");
    } else if (!checked) {
      let intro = document.getElementById("intro");
      intro.setAttribute("style", "display: none");
    }
  }

  componentDidMount() {
    this.datastoreListener();
    this.initSortable();
    this.mceInit();
  }

  render() {
    return (
      <div>
        <textarea name="content" />
        <label className="switch">
          <input
            type="checkbox"
            onInput={(e) => this.toggleHero(e.target.checked)}
          />
          <span className="slider round" />
        </label>
        <div>
          <ol id="plugins" />
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
