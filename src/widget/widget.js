import React, { Component } from "react";
let buildfire = window.buildfire;
let lory = window.lory;
let db = buildfire.datastore;

class Widget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugins: [],
      slideIndex: 0
    };
  }

  loryInit() {
    document.addEventListener("DOMContentLoaded", function() {
      let simple = document.querySelector(".js_simple");
      lory(simple, {
        infinite: 1
      });
    });
  }

  loryFormat(plugins) {
    let simple_dots = document.querySelector(".js_simple_dots");
    let dot_count = plugins.length;
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
        dot_tabs[i].innerHTML = plugins[i].title;
      }
    }, 1);

    let dot_navigation_slider = lory(simple_dots, {
      infinite: 1,
      enableMouseEvents: true
    });
  }

  renderPages() {
    let pages = this.state.pages;
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
    if (pages.length === 0) return;

    pages.forEach(page => {
      console.log(page);
      // PLUGIN SLIDE
      let slide = document.createElement("li");
      slide.classList.add("js_slide");
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
      // CONTENT
      let cont = document.createElement("div");
      // cont.classList.add("");
      // ROW
      let content = document.createElement("div");
      content.classList.add("row");
      // HEADER
      let header = document.createElement("div");
      header.classList.add("col-md-12");
      header.innerHTML = `
        <div class="page-header">
          <h1>${page.header}</h1>
        </div>
      `;
      // DESCRIPTION
      let desc = document.createElement("div");
      desc.classList.add("col-md-12");

      desc.innerHTML = `
          <p>${page.desc}</p>
        `;

      // CONTENT ASSEMBLY
      slide.appendChild(container);
      container.appendChild(row);
      row.appendChild(col);
      col.appendChild(well);
      content.appendChild(header);
      content.appendChild(desc);

      let plugins = page.plugins;
      if (plugins) {
        plugins.forEach(plugin => {
          let div = document.createElement("div");
          div.innerHTML = `
                <img src="${plugin.iconUrl}" style="display: inherit; alt="...">
          `;
          content.appendChild(div);
        });
      }
      cont.appendChild(content);
      well.appendChild(cont);
      // well.appendChild(pluginsDiv);
      // thumb.appendChild(img);
      slides.appendChild(slide);
      // dot_navs.appendChild(dot);
    });

    // DOT NAVS

    // assembly
    frame.appendChild(slides);
    slider.appendChild(frame);
    div.appendChild(slider);

    this.loryFormat(pages);
  }

  listener() {
    db.onUpdate(snapshot => {
      console.log(snapshot);
      switch (snapshot.tag) {
        case "pages": {
          this.setState({ pages: snapshot.data.pages });
          break;
        }
        default:
          return;
      }
    });
  }

  fetch() {
    db.get("pages", (err, response) => {
      if (err) throw err;
      console.log(response);
      // if none are present, insert a default page
      if (!response.id) {
        this.setState({
          pages: [
            {
              title: "new page",
              header: "new page",
              desc: "edit this page in the control"
            }
          ]
        });
      } else {
        this.setState({ pages: response.data.pages });
      }
    });
  }

  componentDidUpdate() {
    console.log(this.state);
    this.renderPages();
  }

  componentDidMount() {
    this.fetch();
    this.listener();
    // this.datastoreFetch();
    // this.datastoreListener();
  }

  render() {
    return (
      <div id="container">
        <div id="intro">
          <div id="hero">{this.state.text}</div>
        </div>
        <div className="slider js_simple_dots simple" />
      </div>
    );
  }
}

export default Widget;
