import React, { Component } from "react";

let buildfire = window.buildfire;
let tinymce = window.tinymce;

class Content extends Component {
  constructor(props) {
    super(props);
    this.logData = this.logData.bind(this);
    this.addImg = this.addImg.bind(this);
    this.state = {
      plugins: null,
      text: "",
      img: ""
    };
  }

  addPlugin(instance) {
    buildfire.datastore.insert(instance, "plugin", (err, res) => {
      if (err) throw err;
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
    buildfire.datastore.search({}, "master", (err, res) => {
      res.forEach(instance => {
        buildfire.datastore.delete(instance.id, "master", (err, result) => {
          if (err) throw err;
          console.log(result);
        });
      });
    });
  }

  logData() {
    buildfire.datastore.search({}, "img", (err, res) => {
      if (err) throw err;
      console.log("text", res);
    });
    buildfire.datastore.search({}, "text", (err, res) => {
      if (err) throw err;
      console.log("text", res);
    });
  }

  addImg() {
    buildfire.imageLib.showDialog({}, (err, result) => {
      if (err) throw err;
      buildfire.datastore.get("img", (err, response) => {
        if (err) throw err;
        console.log(response);
        if (!response.id) {
          buildfire.datastore.insert(
            { img: result.selectedFiles[0] },
            "img",
            true,
            (err, status) => {
              if (err) {
                console.log("insert err");
                throw err;
              }
              console.log(status);
            }
          );
        } else {
          buildfire.datastore.update(
            response.id,
            { img: result.selectedFiles[0] },
            "img",
            (err, status) => {
              if (err) throw err;
              console.log(status);
            }
          );
        }
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
      setup: (editor) => {
        editor.on("init", () => {
          console.log("init");
          let text = tinymce.activeEditor.getContent();
          buildfire.datastore.get("text", (err, response) => {
            if (err) throw err;
            console.log(response);
            if (!response.id) {
              buildfire.datastore.insert(
                { text: text },
                "text",
                true,
                (err, status) => {
                  if (err) {
                    console.log("insert err");
                    throw err;
                  }
                  console.log(status);
                }
              );
            } else {
              tinymce.activeEditor.insertContent(response.data.text);
            }
          });
        });
      },
      init_instance_callback: editor => {
        editor.on("NodeChange", e => {
          let text = tinymce.activeEditor.getContent();
          buildfire.datastore.get("text", (err, response) => {
            if (err) throw err;
            console.log(response);
            if (!response.id) {
              buildfire.datastore.insert(
                { text: text },
                "text",
                true,
                (err, status) => {
                  if (err) {
                    console.log("insert err");
                    throw err;
                  }
                  console.log(status);
                }
              );
            } else {
              buildfire.datastore.update(
                response.id,
                { text: text },
                "text",
                (err, status) => {
                  if (err) throw err;
                  console.log(status);
                }
              );
            }
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

    buildfire.datastore.get("plugins", (err, response) => {
      if (err) throw err;
      console.log(response);
      plugins.loadItems(response.data.plugins);
      if (!response.id) {
        buildfire.datastore.insert(
          { plugins: plugins.items },
          "plugins",
          true,
          (err, status) => {
            if (err) {
              console.log("insert err");
              throw err;
            }
            console.log(status);
          }
        );
      }
    });

    plugins.loadItems(plugins.items, null);

    plugins.onAddItems = () => {
      buildfire.datastore.get("plugins", (err, response) => {
        if (err) throw err;
        console.log(response);
        if (!response.id) {
          buildfire.datastore.insert(
            { plugins: plugins.items },
            "plugins",
            true,
            (err, status) => {
              if (err) {
                console.log("insert err");
                throw err;
              }
              console.log(status);
            }
          );
        } else {
          buildfire.datastore.update(
            response.id,
            { plugins: plugins.items },
            "plugins",
            (err, status) => {
              if (err) throw err;
              console.log(status);
            }
          );
        }
      });
    };

    plugins.onDeleteItem = () => {
      buildfire.datastore.get("plugins", (err, response) => {
        if (err) throw err;
        console.log(response);
        if (!response.id) {
          buildfire.datastore.insert(
            { plugins: plugins.items },
            "plugins",
            true,
            (err, status) => {
              if (err) {
                console.log("insert err");
                throw err;
              }
              console.log(status);
            }
          );
        } else {
          buildfire.datastore.update(
            response.id,
            { plugins: plugins.items },
            "plugins",
            (err, status) => {
              if (err) throw err;
              console.log(status);
            }
          );
        }
      });
    };

    plugins.onOrderChange = () => {
      buildfire.datastore.get("plugins", (err, response) => {
        if (err) throw err;
        console.log(response);
        if (!response.id) {
          buildfire.datastore.insert(
            { plugins: plugins.items },
            "plugins",
            true,
            (err, status) => {
              if (err) {
                console.log("insert err");
                throw err;
              }
              console.log(status);
            }
          );
        } else {
          buildfire.datastore.update(
            response.id,
            { plugins: plugins.items },
            "plugins",
            (err, status) => {
              if (err) throw err;
              console.log(status);
            }
          );
        }
      });
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
    this.initSortable();
    this.mceInit();
  }

  componentDidUpdate() {
    // this.syncData();
  }

  render() {
    return (
      <div>
        <textarea name="content" />
        <label className="switch">
          <input
            type="checkbox"
            onInput={e => this.toggleHero(e.target.checked)}
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
