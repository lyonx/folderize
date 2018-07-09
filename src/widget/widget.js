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
    console.log(document.getElementById("container"));
    // main framework
    let div = document.getElementById("container");
    div.innerHTML = "";

    let slider = document.createElement("div");
    slider.classList.add("slider");
    slider.classList.add("js_simple");

    let frame = document.createElement("div");
    frame.classList.add("frame");
    frame.classList.add("js_frame");

    let slides = document.createElement("div");
    slides.classList.add("slides");
    slides.classList.add("js_slides");

    // for (let i = 0; i < n; i++) {
    //   let slide = document.createElement("li");
    //   slide.classList.add("js_slide");
    //   slide.innerHTML = "slide";
    //   slides.appendChild(slide);
    // }
    plugins.forEach(plugin => {
      console.log(plugin);
      let slide = document.createElement("li");
      slide.classList.add("js_slide");
      slide.innerHTML = plugin.data.title;
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
    });

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
        <div className="slider js_simple">
          <div className="frame js_frame">
            <ul id="slideContainer" className="slides js_slides">
              <li className="js_slide">1</li>
              <li className="js_slide">2</li>
              <li className="js_slide">3</li>
            </ul>
          </div>
          <span className="js_prev prev">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 501.5 501.5"
            >
              <g>
                <path
                  fill="#2E435A"
                  d="M302.67 90.877l55.77 55.508L254.575 250.75 358.44 355.116l-55.77 55.506L143.56 250.75z"
                />
              </g>
            </svg>
          </span>
          <span className="js_next next">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 501.5 501.5"
            >
              <g>
                <path
                  fill="#2E435A"
                  d="M199.33 410.622l-55.77-55.508L247.425 250.75 143.56 146.384l55.77-55.507L358.44 250.75z"
                />
              </g>
            </svg>
          </span>
        </div>

        <ul className="js_dots dots">
          <li className="" />
          <li className="active" />
          <li />
          <li />
          <li />
          <li />
        </ul>
        <button className="btn btn-default" onClick={() => this.test(3)}>
          Add
        </button>
      </div>
    );
  }
}

export default Widget;
