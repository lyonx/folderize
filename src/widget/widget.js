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
    buildfire.datastore.search({}, "img", (err, result) => {
      if (err) throw err;
      if(result.length === 0) return;
      console.log(result);
      document
        .getElementById("intro")
        .setAttribute("style", `background: url("${result[0].data[0]}");`);
    });
  }

  pluginListener() {
    buildfire.datastore.onUpdate(plugin => {
      console.log(`onUpdate ============= `);
      console.log("update return:", plugin);
      if (plugin.tag === "plugin") {
        let temp = this.state.plugins;
        temp.push(plugin);
        this.setState({
          plugins: temp
        });
        this.renderPlugins();
      } else {
        buildfire.datastore.search({}, "img", (err, result) => {
          if (err) throw err;
          console.log(result);
          document
            .getElementById("intro")
            .setAttribute("style", `background: url("${result[0].data[0]}")`);
        });
      }
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
    let simple_dots = document.querySelector(".js_simple_dots");
    let dot_count = this.state.plugins.length;
    let dot_container = simple_dots.querySelector(".js_dots");

    console.log(dot_container);
    let dot_list_item = document.createElement("li");

    function handleDotEvent(e) {
      if (e.type === "before.lory.init") {
        for (var i = 0, len = dot_count; i < len; i++) {
          var clone = dot_list_item.cloneNode();
          dot_container.appendChild(clone);
        }
        dot_container.childNodes[0].classList.add("active");
      }
      if (e.type === "after.lory.init") {
        for (var i = 0, len = dot_count; i < len; i++) {
          dot_container.childNodes[i].addEventListener("click", function(e) {
            dot_navigation_slider.slideTo(
              Array.prototype.indexOf.call(dot_container.childNodes, e.target)
            );
          });
        }
      }
      if (e.type === "after.lory.slide") {
        for (var i = 0, len = dot_container.childNodes.length; i < len; i++) {
          dot_container.childNodes[i].classList.remove("active");
        }
        dot_container.childNodes[e.detail.currentSlide - 1].classList.add(
          "active"
        );
      }
      if (e.type === "on.lory.resize") {
        for (var i = 0, len = dot_container.childNodes.length; i < len; i++) {
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
        console.log(this.state.plugins);
        dot_tabs[i].innerHTML = this.state.plugins[i].data.title;
      }
    }, 1);

    var dot_navigation_slider = lory(simple_dots, {
      infinite: 1,
      enableMouseEvents: true
    });
    // console.log(simple);
    // lory(simple, {
    //   infinite: 1
    // });
  }

  renderPlugins() {
    let plugins = this.state.plugins;
    console.log(plugins);
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
    console.log(slider);

    let preFrame = document.querySelector(".js_frame");
    let frame;
    console.log(preFrame);
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

    plugins.forEach(plugin => {
      let index = plugins.indexOf(plugin);
      // PLUGIN SLIDE
      let slide = document.createElement("li");
      let dot = document.createElement("li");
      slide.classList.add("js_slide");
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
    this.pluginFetch();
    this.pluginListener();
  }

  render() {
    return (
      <div id="container">
        <div id="intro" />
        <div className="slider js_simple_dots simple" />
      </div>
    );
  }
}

export default Widget;
