import React, { Component } from "react";
// import Slides from "./components/Slides/slides.js";
let buildfire = window.buildfire;
let lory = window.lory;

/* 
notes:
fix issue where array outputted by getPluginInstance returns length[0] 

*/

class Widget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugins: [],
      slideIndex: 0
    };
  }

  datastoreFetch() {
    this.getPlugins();
    buildfire.datastore.search({}, "img", (err, result) => {
      if (err) throw err;
      if (result.length === 0) return;
      document
        .getElementById("intro")
        .setAttribute("style", `background: url("${result[0].data[0]}");`);
    });
    buildfire.datastore.search({}, "text", (err, result) => {
      if (err) throw err;
      if (!result[0]) return;
      let hero = document.getElementById("hero");
      hero.innerHTML = "";
      hero.innerHTML = result[0].data.text;
    });
  }

  getPlugins() {
    buildfire.datastore.search({}, "plugins", (err, result) => {
      if (err) throw err;
      console.warn(result);
      this.setState({ plugins: [] });
      console.log(typeof this.state.plugins);
      let plugins = this.state.plugins;
      plugins = result[0].data.plugins;
      let temp = [];
      let test = ["hi", "world"];
      console.log(test);
      console.log(typeof temp);
      plugins.forEach(plugin => {
        console.log(plugin);
        buildfire.pluginInstance.get(plugin.instanceId, (err, inst) => {
          if (err) throw err;
          temp.push(inst);
        });
      });
      console.dir(temp);
      console.log(temp[0]);
      // result.forEach(plugin => {
      //   console.log(plugin);
      //   // 
      // });
      this.setState({
        plugins: plugins
      });
      this.renderPlugins();
    });
  }

  datastoreListener() {
    buildfire.datastore.onUpdate(snapshot => {
      console.log("update return:", snapshot);
      if (snapshot.status === "updated") {
        // if (!snapshot.data) {
          this.getPlugins();
          // return;
        // }
        // let temp = this.state.plugins;
        // temp.push(snapshot);
        // this.setState({
        //   plugins: temp
        // });
        // this.renderPlugins();
      } else if (snapshot.tag === "img") {
        buildfire.datastore.search({}, "img", (err, result) => {
          if (err) throw err;
          document
            .getElementById("intro")
            .setAttribute("style", `background: url("${result[0].data[0]}")`);
        });
      } else if (snapshot.tag === "text") {
        buildfire.datastore.search({}, "text", (err, result) => {
          if (err) throw err;
          let hero = document.getElementById("hero");
          hero.innerHTML = "";
          hero.innerHTML = result[0].data.text;
        });
      } else if (snapshot.tag === "heroColor") {
        buildfire.datastore.search({}, "heroColor", (err, result) => {
          if (err) throw err;
          let hero = document.querySelector("#hero");
          hero.setAttribute("style", `${result[0].data.color.colorCSS}`);
        });
      } else {
        return;
      }
    });
  }

  loryInit() {
    document.addEventListener("DOMContentLoaded", function() {
      let simple = document.querySelector(".js_simple");
      lory(simple, {
        infinite: 1
      });
    });
  }

  loryFormat() {
    let simple_dots = document.querySelector(".js_simple_dots");
    let dot_count = this.state.plugins.length;
    let dot_container = simple_dots.querySelector(".js_dots");

    let dot_list_item = document.createElement("li");

    function handleDotEvent(e) {
      if (e.type === "before.lory.init") {
        for (let i = 0, len = dot_count; i < len; i++) {
          let clone = dot_list_item.cloneNode();
          dot_container.appendChild(clone);
        }
        dot_container.childNodes[0].classList.add("active");
      }
      if (e.type === "after.lory.init") {
        for (let i = 0, len = dot_count; i < len; i++) {
          dot_container.childNodes[i].addEventListener("click", function(e) {
            dot_navigation_slider.slideTo(
              Array.prototype.indexOf.call(dot_container.childNodes, e.target)
            );
          });
        }
      }
      if (e.type === "after.lory.slide") {
        for (let i = 0, len = dot_container.childNodes.length; i < len; i++) {
          dot_container.childNodes[i].classList.remove("active");
        }
        dot_container.childNodes[e.detail.currentSlide - 1].classList.add(
          "active"
        );
      }
      if (e.type === "on.lory.resize") {
        for (let i = 0, len = dot_container.childNodes.length; i < len; i++) {
          dot_container.childNodes[i].classList.remove("active");
        }
        dot_container.childNodes[0].classList.add("active");
      }
    }
    simple_dots.addEventListener("before.lory.init", handleDotEvent);
    simple_dots.addEventListener("after.lory.init", handleDotEvent);
    simple_dots.addEventListener("after.lory.slide", handleDotEvent);
    simple_dots.addEventListener("on.lory.resize", handleDotEvent);

    setTimeout(() => {
      let dot_tabs = simple_dots.querySelector(".js_dots").childNodes;
      for (let i = 0; i < dot_tabs.length; i++) {
        dot_tabs[i].innerHTML = this.state.plugins[i].title;
      }
    }, 1);

    let dot_navigation_slider = lory(simple_dots, {
      infinite: 1,
      enableMouseEvents: true
    });
  }

  renderPlugins() {
    console.count("render");
    let plugins = this.state.plugins;
    console.table(plugins);
    if (plugins.length <= 0) {
      return;
    }
    // QUERY SELECTORS
    let div = document.getElementById("container");

    // MAIN FRAMEWORK
    let slider = document.querySelector(".js_simple_dots");
    slider.innerHTML = "";
    let dot_container = document.createElement("ul");
    dot_container.classList.add("js_dots");
    dot_container.classList.add("dots");
    dot_container.setAttribute("id", "dot-nav");
    slider.appendChild(dot_container);

    let preFrame = document.querySelector(".js_frame");
    let frame;
    if (preFrame) {
      preFrame.innerHTML = "";
      frame = preFrame;
    } else {
      frame = document.createElement("div");
      frame.classList.add("frame");
      frame.classList.add("js_frame");
    }

    let slides = document.createElement("div");
    slides.classList.add("slides");
    slides.classList.add("js_slides");
    if (plugins.length === 0) return;
    plugins.forEach(plugin => {
      let index = plugins.indexOf(plugin);
      // PLUGIN SLIDE
      let slide = document.createElement("li");
      slide.classList.add("js_slide");
      slide.setAttribute("index", index);
      slide.setAttribute("id", `plugin${index}`);
      slide.setAttribute(
        "style",
        `background-image: url("${plugin.iconUrl}`
      );
      slide.onclick = e => {
        let index = document.getElementById(e.target.id).getAttribute("index");

        let target = this.state.plugins[index];
        console.log(target);
        let pluginData = {
          pluginId: target.pluginTypeId,
          instanceId: target.instanceId,
          folderName: target._buildfire.pluginType.result[0].folderName,
          title: target.title
        };

        buildfire.navigation.navigateTo(pluginData);
      };
      slides.appendChild(slide);
      // dot_navs.appendChild(dot);
    });

    // DOT NAVS

    // assembly
    frame.appendChild(slides);
    slider.appendChild(frame);
    div.appendChild(slider);

    this.loryFormat();
  }

  componentDidMount() {
    this.datastoreFetch();
    this.datastoreListener();
  }

  render() {
    return (
      <div id="container">
        <div id="intro">
          <div id="hero" />
        </div>
        <div className="slider js_simple_dots simple" />
      </div>
    );
  }
}

export default Widget;
