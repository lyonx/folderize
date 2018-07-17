import React, { Component } from "react";
import Page from "./components/Pages/Page";
let buildfire = window.buildfire;
let lory = window.lory;
let db = buildfire.datastore;

class Widget extends Component {
  constructor(props) {
    super(props);
    this.renderPages = this.renderPages.bind(this);
    this.state = {
      pages: [],
      plugins: [],
      slideIndex: 0
    };
  }

  loryFormat() {
    console.count("formatter");

    let pages = this.state.pages;
    if (pages.length === 0) return;
    let simple_dots = document.querySelector(".js_simple_dots");
    let dot_count = pages.length;
    let dot_container = simple_dots.querySelector(".js_dots");
    let dot_list_item = document.createElement("li");

    const handleDotEvent = e => {
      if (e.type === "before.lory.init") {
        if (pages.length != this.state.pages.length) return;
        for (let i = 0, len = dot_count; i < len; i++) {
          let clone = dot_list_item.cloneNode();
          if (dot_container.childNodes.length >= pages.length) return;
          // console.log(pages[i],  pages[0]);
          dot_container.appendChild(clone);
          console.count("dot container");
        }
        dot_container.childNodes[0].classList.add("active");
      }
      if (e.type === "after.lory.init") {
        for (let i = 0, len = dot_count; i < len; i++) {
          if (!dot_container.childNodes[i]) return;
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
    };
    simple_dots.addEventListener("before.lory.init", handleDotEvent);
    simple_dots.addEventListener("after.lory.init", handleDotEvent);
    simple_dots.addEventListener("after.lory.slide", handleDotEvent);
    simple_dots.addEventListener("on.lory.resize", handleDotEvent);

    setTimeout(() => {
      let dot_tabs = simple_dots.querySelector(".js_dots").childNodes;
      for (let i = 0; i < dot_tabs.length; i++) {
        if (!this.state.pages[i]) return;
        dot_tabs[i].innerHTML = this.state.pages[i].title;
      }
    }, 1);

    let dot_navigation_slider = lory(simple_dots, {
      infinite: 1,
      enableMouseEvents: true
    });
  }

  renderPages() {
    let pages = [];

    // console.log(this.state.pages);

    if (document.querySelector(".js_slides")) {
      document.querySelector(".js_slides").innerHTML = "";
      // console.log("cleared slides");
    }

    if (document.querySelector(".js_dots")) {
      let dots = document.querySelector(".js_dots");
      // console.log(dots.childElementCount, this.state.pages.length);
      if (dots.childElementCount > this.state.pages.length) {
        while (dots.childElementCount > 0) {
          dots.removeChild(dots.firstChild);
        }
        // console.log(dots);
      }
      // debugger
      // console.log("cleared", dots);
    }

    if (this.state.pages.length === 0) return;
    this.state.pages.forEach(page => {
      pages.push(<Page data={page} />);
    });

    setTimeout(() => this.loryFormat(), 100);
    return pages;
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
              desc: "edit this page in the control",
              plugins: []
            }
          ]
        });
      } else {
        this.setState({ pages: response.data.pages });
      }
    });
  }

  componentDidUpdate() {
    // console.log(this.state);
    // this.loryFormat();
    // this.renderPages();
  }

  componentDidMount() {
    this.fetch();
    this.listener();
  }

  render() {
    return (
      <div id="container">
        <div id="intro">
          <div id="hero">{this.state.text}</div>
        </div>
         <div className="slider js_simple_dots simple">
         <ul className="dots js_dots" id="dot-nav" />
            <div className="frame js_frame">
         <div id="sandbox">
               <ul className="slides js_slides">{this.renderPages()}</ul>
         </div>
            </div>
        </div>
      </div>
    );
  }
}

export default Widget;
