import React, { Component } from "react";
// import Slides from "./components/Slides/slides.js";

class Widget extends Component {
  constructor(props) {
    super(props);
    this.plusDivs = this.plusDivs.bind(this);
    this.currentDiv = this.currentDiv.bind(this);
    this.state = {
      plugins: [],
      slideIndex: 0
    };
  }

  renderPlugins() {
    let plugins = this.state.plugins;
    if (plugins.length === 0) return console.log("no plugins");
    // TARGET CONTAINERS
    var pluginsContainer = document.getElementById("pluginsContainer");
    let pages = document.getElementById("pagination");
    pluginsContainer.innerHTML = "";
    pages.innerHTML = "";
    // LOOP THROUGH PLUGINS
    plugins.forEach(plugin => {
      // DEFINE INDEX
      let index = plugins.indexOf(plugin);
      // PLUGIN CARD
      let panel = document.createElement("div");
      panel.classList.add("panel");
      panel.classList.add("slide");
      // CARD IMG
      let img = document.createElement("img");
      img.classList.add("card-img");
      img.setAttribute("index", index);
      img.setAttribute("id", `plugin${index}`);
      img.setAttribute("src", plugin.data.iconUrl);
      // PLUGIN CARD BODY
      let body = document.createElement("div");
      body.classList.add("panel-body");
      body.setAttribute("id", `plugin${index}`);
      body.setAttribute("index", index);
      // CLICK NAV HANDLER
      body.onclick = e => {
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
      // // PLUGIN TITLE
      // let title = document.createElement("h5");
      // title.classList.add("panel-heading");
      // title.setAttribute("index", index);
      // title.setAttribute("id", `plugin${index}`);
      // title.innerHTML = plugin.data.title;
      // ASSEMBLY
      // body.appendChild(title);
      body.appendChild(img);
      panel.appendChild(body);
      pluginsContainer.appendChild(panel);
      // PAGINATION
      let page = document.createElement("div");
      let pageTitle = document.createElement("p");
      pageTitle.innerHTML = plugin.data.title;
      pageTitle.classList.add("text-center");
      page.appendChild(pageTitle);
      page.classList.add("page");
      page.classList.add("demo");
      page.setAttribute("value", index + 1);
      pages.appendChild(page);

      let hammertime = new Hammer(panel);
      // hammertime.get("pan").set({ direction: Hammer.DIRECTION_HORIZONTAL });
      hammertime.get("pan").set({
        direction: Hammer.DIRECTION_HORIZONTAL,
        threshold: "10"
      });

      hammertime.on("swipe", e => {
        console.log(e.direction);
        switch (e.direction) {
          case 4:
            {
              this.plusDivs(-1);
            }
            break;
          case 2:
            {
              this.plusDivs(1);
            }
            break;
        }
      });
    });
    this.plusDivs(1);
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

  plusDivs(e) {
    let n;
    // IF INDEX IS PASSED DIRECTLY SET N TO INDEX
    if (typeof e === "number") {
      console.log(e);
      n = e;
    } else {
      // OTHERWISE FETCH INDEX
      n = parseInt(e.target.value);
    }
    let index = this.state.slideIndex;
    console.log(index, n);
    let newIndex = index + n;
    this.setState({ slideIndex: newIndex });
    this.showDivs(parseInt(this.state.slideIndex));
  }

  showDivs(n) {
    let index = this.state.slideIndex;
    var i;
    let x = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("demo");
    if (n > x.length) {
      index = 1;
      this.setState({ slideIndex: index });
    }
    if (n < 1) {
      index = x.length;
      this.setState({ slideIndex: index });
    }
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" tab-active", "");
    }
    x[index - 1].style.display = "block";
    dots[index - 1].className += " tab-active";
  }

  currentDiv(e) {
    let n = e.target.value;
    let index = this.state.slideIndex;
    this.setState({ slideIndex: index });
    this.showDivs((index = n));
  }

  componentDidMount() {
    this.pluginFetch();
    this.pluginListener();
    ///create new instance of buildfire carousel viewer
    var view = new buildfire.components.carousel.view("#carousel", []);
    /// load items
    function loadItems(carouselItems) {
      // create an instance and pass it the items if you don't have items yet just pass []
      view.loadItems(carouselItems);
    }
    /// load any previously saved items
    buildfire.datastore.get(function(err, obj) {
      console.log(obj);
      if (err) alert("error");
      else loadItems(obj.data.carouselItems);
    });
    /// handle any updates by reloading
    buildfire.datastore.onUpdate(function(e) {
      console.log(e.data);
      loadItems(e.data.carouselItems);
    });
  }

  render() {
    return (
      <div id="container">
        <div id="carousel" />
        <div id="slideshow">
          <div id="pagination" />
        </div>
        <div id="pluginsContainer" />
      </div>
    );
  }
}

export default Widget;
