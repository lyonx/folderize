import React, { Component } from "react";
let buildfire = window.buildfire;
let lory = window.lory;


class Widget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugins: [],
      slideIndex: 0
    };
  }

  datastoreFetch() {
     buildfire.datastore.get("master", (err, response) => {
        if (err) throw err;
      console.log(response);
      this.getPlugins(response.data.plugins);
      this.renderText(response.data.text);
      this.renderImg(response.data.img);
      this.setState({
         plugins: response.data.plugins,
         text: response.data.text,
         img: response.data.img
      });
     });
  }

  getPlugins(result) {

      console.warn(this.state.plugins);
      console.warn(result);
      if (this.state.plugins === result) {
         console.log("render prevented");
         debugger;
         return;
      }

      let plugins = result;
      let temp = new Array(plugins.length);
      console.log(result);
      plugins.forEach(plugin => {
        buildfire.pluginInstance.get(plugin.instanceId, (err, inst) => {
          if (err) throw err;
          let currentIndex = plugins.indexOf(plugin);
          temp[currentIndex] = inst;
          console.log(temp);
          this.setState({
            plugins: temp
          });
          console.log(temp.includes(undefined));
          if (!temp.includes(undefined)) {
            this.renderPlugins();
          }
        });
      });
  }

  renderText(text) {
     
     if (text === this.state.text) {
        console.log("renderText prevented");
        return;
     }
     let hero = document.getElementById("hero");
      hero.innerHTML = "";
      hero.innerHTML = text;
  }

  renderImg(img) {
          if (img === this.state.img) {
        console.log("renderImg prevented");
        return;
     }
      document
          .getElementById("intro")
          .setAttribute("style", `background: url("${img}")`);
  }

  datastoreListener() {
     console.log("listener active");
    buildfire.datastore.onUpdate(response => {
      console.log("update return:", response);
      this.getPlugins(response.data.plugins);
      // this.renderText(response.data.text);
            this.renderImg(response.data.img);
            this.setState({ text: response.data.text });
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
      // slide.setAttribute("index", index);
      // slide.setAttribute("id", `plugin${index}`);
      // CONTAINER
      let container = document.createElement("div");
      container.classList.add("container-fluid");
      // ROW
      let row = document.createElement("div");
      row.classList.add("row");
      // COL
      let col = document.createElement("div");
      col.classList.add("col-md-12");
      col.classList.add("slide-col");
      // WELL
      let well = document.createElement("div");
      well.classList.add("well");
      // THUMBNAIL
      let thumb = document.createElement("div");
      thumb.classList.add("thumbnail");
      // IMG
      let img = document.createElement("img");
      // CONTENT ASSEMBLY
      slide.appendChild(container);
      container.appendChild(row);
      row.appendChild(col);
      col.appendChild(well);
      well.appendChild(thumb);
      thumb.appendChild(img);
      img.setAttribute("index", index);
      img.setAttribute("id", `plugin${index}`);
      img.classList.add("slide-img");
      img.setAttribute("src", plugin.iconUrl);
      img.onclick = e => {
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
          <h1 id="hero">
          {this.state.text}
          </h1>
        </div>
        <div className="slider js_simple_dots simple" />
      </div>
    );
  }
}

export default Widget;
