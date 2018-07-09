import React, { Component } from "react";
// import Slides from "./components/Slides/slides.js";

class Widget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugins: [],
      slideIndex: 0
    };
  }

  pluginFetch() {
    buildfire.datastore.search({}, "plugin", (err, result) => {
      if (err) throw err;
      console.log(result);
      let temp = this.state.plugins;
      result.forEach(plugin => temp.push(plugin));
      this.setState({
        plugins: temp
      });
      this.renderPlugins();
    });
  }

  pluginListener() {
    buildfire.datastore.onUpdate(plugin => {
      console.log(`onUpdate ============= `);
      console.log("update return:", plugin);
      let temp = this.state.plugins;
      temp.push(plugin);
      this.setState({
        plugins: temp
      });
      this.renderPlugins();
    });
  }

  loryInit(c) {
    document.addEventListener("DOMContentLoaded", function() {
      var simple = document.querySelector(".js_simple");
      console.log(simple);
      lory(simple, {
        infinite: 1
      });
    });
  }

  loryFormat() {
    var simple = document.querySelector(".js_simple");
    console.log(simple);
    lory(simple, {
      infinite: 1
    });
  }

  renderPlugins() {
    let plugins = this.state.plugins;

    // QUERY SELECTORS
    var dot_navs = document.querySelector(".js_dots.dots");
    let div = document.getElementById("container");
    div.innerHTML = "";
    dot_navs.innerHTML = "";
    console.log(dot_navs);

    // MAIN FRAMEWORK
    let slider = document.createElement("div");
    slider.classList.add("slider");
    slider.classList.add("js_simple");

    let frame = document.createElement("div");
    frame.classList.add("frame");
    frame.classList.add("js_frame");

    let slides = document.createElement("div");
    slides.classList.add("slides");
    slides.classList.add("js_slides");

    plugins.forEach(plugin => {
      let index = plugins.indexOf(plugin);
      // PLUGIN SLIDE
      let slide = document.createElement("li");
      let dot = document.createElement("li");
      slide.classList.add("js_slide");
      slide.innerHTML = plugin.data.title;
      slide.setAttribute("index", index);
      slide.setAttribute("id", `plugin${index}`);
      slide.setAttribute(
        "style",
        `background-image: url("${plugin.data.iconUrl}`
      );
      slide.onclick = e => {
        console.log(e.target);
        let index = document.getElementById(e.target.id).getAttribute("index");
        console.log(index);

        let target = this.state.plugins[index].data;

        let pluginData = {
          pluginId: target.pluginTypeId,
          instanceId: target.instanceId,
          folderName: target._buildfire.pluginType.result[0].folderName,
          title: target.title
        };

        buildfire.navigation.navigateTo(pluginData);
      };
      slides.appendChild(slide);
      dot_navs.appendChild(dot);
    });

    // DOT NAVS
    let dot_count = plugins.length;

    // assembly
    frame.appendChild(slides);
    slider.appendChild(frame);
    div.appendChild(slider);

    this.loryFormat();
  }

  componentDidMount() {
    this.pluginFetch();
    this.pluginListener();
  }

  render() {
    return (
      <div id="container">
        <ul className="js_dots dots" id="dot-nav" />
      </div>
    );
  }
}

export default Widget;
