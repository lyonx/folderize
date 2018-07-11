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

  

  renderPlugins() {
    console.count("content render");
    let plugins = this.state.plugins;
    let pluginContainer = document.getElementById("plugins");
    pluginContainer.innerHTML = "";
    if (plugins.length <= 0) {
      return;
    }

    plugins.forEach(plugin => {
      let index = plugins.indexOf(plugin);

      let pluginLi = document.createElement("li");
      // pluginLi.classList.add("carousel-items");
      // pluginLi.classList.add("hide-empty");
      // pluginLi.classList.add("draggable-list-view");
      // pluginLi.classList.add("margin-top-twenty");
      // pluginLi.classList.add("border-radius-four");
      // pluginLi.classList.add("border-grey");
      // pluginLi.classList.add("plugin");
      pluginLi.classList.add("d-item");
      pluginLi.classList.add("clearfix");

      let title = document.createElement("p");
      title.innerHTML = plugin.data.title;
      title.classList.add("title");
      pluginLi.appendChild(title);
      // pluginLi.innerHTML = plugin.data.title;

      let deleteBtn = document.createElement("button");
      deleteBtn.classList.add("btn-icon");
      deleteBtn.classList.add("btn-delete-icon");
      deleteBtn.classList.add("btn-danger");
      deleteBtn.classList.add("transition-third");
      deleteBtn.classList.add("delete");
      deleteBtn.setAttribute("id", `plugin${index}`);
      deleteBtn.setAttribute("index", index);
      deleteBtn.onclick = e => {
        let index = document.getElementById(e.target.id).getAttribute("index");

        let target = this.state.plugins[index];

        buildfire.datastore.delete(target.id, "plugin", (err, result) => {
          if (err) throw err;
          console.warn(result);
        });
        this.datastoreFetch();
      };
      pluginLi.appendChild(deleteBtn);
      pluginContainer.appendChild(pluginLi);
    });
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
      if (!instances) return;
      if (instances.length > 0) {
        this.prepPlugins(instances);
      } else return;
    });
  }

  clearData() {
    buildfire.datastore.search({}, "text", (err, res) => {
      res.forEach(instance => {
        buildfire.datastore.delete(instance.id, "text", (err, result) => {
          if (err) throw err;
        });
      });
    });
    buildfire.datastore.search({}, "plugin", (err, res) => {
      res.forEach(instance => {
        buildfire.datastore.delete(instance.id, "plugin", (err, result) => {
          if (err) throw err;
        });
      });
    });
    buildfire.datastore.search({}, "img", (err, res) => {
      res.forEach(instance => {
        buildfire.datastore.delete(instance.id, "img", (err, result) => {
          if (err) throw err;
        });
      });
    });
    buildfire.datastore.search({}, "heroColor", (err, res) => {
      res.forEach(instance => {
        buildfire.datastore.delete(instance.id, "heroColor", (err, result) => {
          if (err) throw err;
        });
      });
    });
  }

  logData() {
    buildfire.datastore.search({}, "img", (err, res) => {
      if (err) throw err;
    });
    buildfire.datastore.search({}, "plugin", (err, res) => {
      if (err) throw err;
    });
    buildfire.datastore.search({}, "heroColor", (err, res) => {
      if (err) throw err;
    });
    buildfire.datastore.search({}, (err, res) => {
      if (err) throw err;
    });
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
