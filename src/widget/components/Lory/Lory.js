import React, { Component } from "react";
import Page from "../Pages/Page";

class Lory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pages: props.pages
    };
  }

  loryFormat() {
    let pages = this.state.pages;
    if (pages.length === 0) return;
    console.count("format");
    let simple_dots = document.querySelector(".js_simple_dots");
    let dot_count = pages.length;
    let dot_container = simple_dots.querySelector(".js_dots");
    let dot_list_item = document.createElement("li");

    const handleDotEvent = e => {
      console.log(e.type);
      if (e.type === "before.lory.init") {
        if (pages.length != this.state.pages.length) return;
        for (let i = 0, len = dot_count; i < len; i++) {
          let clone = dot_list_item.cloneNode();
          if (dot_container.childNodes.length >= pages.length) return;
          dot_container.appendChild(clone);
        }
        dot_container.childNodes[0].classList.add("backgroundColorTheme");
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
          dot_container.childNodes[i].classList.remove("backgroundColorTheme");
        }
        dot_container.childNodes[e.detail.currentSlide].classList.add(
          "backgroundColorTheme"
        );
        // localStorage.setItem("currentSlide", e.detail.currentSlide);
        // console.log(localStorage.getItem("currentSlide"));
      }
      if (e.type === "on.lory.resize") {
        for (let i = 0, len = dot_container.childNodes.length; i < len; i++) {
          dot_container.childNodes[i].classList.remove("backgroundColorTheme");
        }
        dot_container.childNodes[0].classList.add("backgroundColorTheme");
      }
    };
    // simple_dots.removeEventListener("before.lory.init", handleDotEvent, true);
    // simple_dots.removeEventListener("after.lory.slide", handleDotEvent, true);

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
      infinite: 0,
      enableMouseEvents: true
      // initialIndex: 1
    });
  }

  renderPages() {
    let pages = [];
    if (document.querySelector(".js_slides")) {
      console.log("clear");
      document.querySelector(".js_slides").innerHTML = "";
    }

    if (document.querySelector(".js_dots")) {
      let dots = document.querySelector(".js_dots");
      if (dots.childElementCount > this.state.pages.length) {
        while (dots.childElementCount > 0) {
          dots.removeChild(dots.firstChild);
        }
      }
    }
    if (this.state.pages.length === 0) return;
    this.state.pages.forEach(page => {
      pages.push(<Page index={this.state.pages.indexOf(page)} data={page} />);
    });
    return pages;
  }

  componentDidMount() {
    console.log(this.props);
  }

  componentDidUpdate() {
    console.log(this.state);
  }
  render() {
    return (
      <div className="slider js_simple_dots simple">
        <ul
          className="dots js_dots sticky defaultBackgroundTheme titleBarTextAndIcons"
          id="dot-nav"
        />
        <div className="frame js_frame">
          <div id="sandbox">
            <ul className="slides js_slides">{this.renderPages()}</ul>
          </div>
        </div>
      </div>
    );
  }
}

export default Lory;
