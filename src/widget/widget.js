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
        dot_container.childNodes[e.detail.currentSlide].classList.add("backgroundColorTheme");
      }
      if (e.type === "on.lory.resize") {
        for (let i = 0, len = dot_container.childNodes.length; i < len; i++) {
          dot_container.childNodes[i].classList.remove("backgroundColorTheme");
        }
        dot_container.childNodes[0].classList.add("backgroundColorTheme");
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
      infinite: 0,
      enableMouseEvents: true
    });
  }

  renderPages() {
    let pages = [];
    if (document.querySelector(".js_slides")) {
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
      pages.push(<Page data={page} />);
    });
    return pages;
  }

  listener() {
    db.onUpdate(snapshot => {
      switch (snapshot.tag) {
        case "pages": {
          this.setState({ pages: snapshot.data.pages });
          break;
        }
        case "image": {
          this.setState({ image: snapshot.data.image });
          break;
        }
        case "text": {
          this.setState({ text: snapshot.data.text });
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
    db.get("image", (err, response) => {
      if (err) throw err;
      // if none are present, insert a default page
      if (!response.id) {
        return;
      } else {
        this.setState({ image: response.data.image });
      }
    });
    db.get("text", (err, response) => {
      if (err) throw err;
      // if none are present, insert a default page
      if (!response.id) {
        return;
      } else {
        this.setState({ text: response.data.text });
      }
    });
  }

  componentDidUpdate() {
    this.loryFormat();
  }

  componentDidMount() {
    this.fetch();
    this.listener();
  }

  render() {
    return (
      <div id="container backgroundColorTheme">
        <div className="slider js_simple_dots simple">
          <ul className="dots js_dots sticky defaultBackgroundTheme" id="dot-nav" />
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
