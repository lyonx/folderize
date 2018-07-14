import React, { Component } from "react";

let buildfire = window.buildfire;
let tinymce = window.tinymce;

class Content extends Component {
   constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.logData = this.logData.bind(this);
      this.addImg = this.addImg.bind(this);
      this.state = {
         plugins: null,
         text: "",
         img: ""
      };
   }

   syncData() {
      console.warn("sync");
      buildfire.datastore.get("master", (err, response) => {
         if (err) throw err;
         console.log(response);
         if (!response.id) {
            buildfire.datastore.insert(this.state, "master", true, (err, status) => {
               if (err) {
                  console.log("insert err");
                  throw err;
               }
               console.log(status);
            });
         } else if (this.state.plugins === null) {
            this.setState({
               plugins: response.data.plugins,
               text: response.data.text,
               img: response.data.img
            });
         } else {
            buildfire.datastore.update(response.id, this.state, "master", (err, status) => {
               if (err) throw err;
               console.log(status.data, this.state);
               console.log(status.data.text === this.state.text);
               console.log(status.data.plugins === this.state.plugins);

               console.log(status.data.img === this.state.img && status.data.text === this.state.text && status.data.plugins === this.state.plugins);

               if (status.data === this.state) {
                  this.setState({
                     plugins: status.data.plugins,
                     text: status.data.text,
                     img: status.data.img
                  });
               }
            });
         }
      });
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

      buildfire.datastore.search({}, "master", (err, res) => {
         if (err) throw err;
         console.log("text", res);
      });

      // buildfire.datastore.search({}, "text", (err, res) => {
      //    if (err) throw err;
      //    console.log("text", res);
      // });
      // buildfire.datastore.search({}, "img", (err, res) => {
      //    if (err) throw err;
      //    console.log("img", res);
      // });
      // buildfire.datastore.search({}, "plugins", (err, res) => {
      //    if (err) throw err;
      //    console.log("plugins: ", res);
      // });
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

         this.setState({ img: result.selectedFiles[0] });
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
               this.setState({ text: text });
               // buildfire.datastore.search({}, "text", (err, res) => {
               //    if (err) throw err;
               //    console.log(res);
               //    if (res[0]) {
               //       buildfire.datastore.delete(res[0].id, "text", (err, status) => {
               //          if (err) throw err;
               //          console.log(status);
               //       });
               //    }
               //    buildfire.datastore.insert({ text }, "text", (err, res) => {
               //       if (err) throw err;
               //    });
               // });
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

      buildfire.datastore.get("master", (err, response) => {
         if (err) throw err;
         console.log(response);
         plugins.loadItems(response.data.plugins, null);
      });

      plugins.loadItems(this.state.plugins, null);

      plugins.onAddItems = () => {
         this.setState({ plugins: plugins.items });
      };

      plugins.onDeleteItem = () => {
         this.setState({ plugins: plugins.items });
      };

      plugins.onOrderChange = () => {
         this.setState({ plugins: plugins.items });
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

   handleChange(event) {
      this.setState({ text: event.target.value });
   }

   componentDidMount() {
      this.syncData();
      this.datastoreListener();
      this.initSortable();
      this.mceInit();
   }

   componentDidUpdate() {
      setTimeout(() => {
      this.syncData();
      });
   }

   render() {
      return (
         <div>
            <input type="text" value={this.state.text} onChange={this.handleChange}></input>
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
