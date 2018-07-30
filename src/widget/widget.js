import React, { Component } from 'react';
import Page from './components/Pages/Page';

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
      currentSlide: null
    };
  }

  loryFormat() {
    let slideIndex = localStorage.getItem('currentSlide');
    let pages = this.state.pages;
    
    if (pages.length === 0) return;
    console.count('format');
    let simple_dots = document.querySelector('.js_simple_dots');
    
    let dot_count = pages.length;
    let dot_container = simple_dots.querySelector('.js_dots');
    let dot_list_item = document.createElement('li');

    const handleDotEvent = e => {
      // console.log(e.type);
      if (e.type === 'before.lory.init') {
        if (pages.length != this.state.pages.length) return;
        for (let i = 0, len = dot_count; i < len; i++) {
          let clone = dot_list_item.cloneNode();
          if (dot_container.childNodes.length >= pages.length) return;
          dot_container.appendChild(clone);
        }
        dot_container.childNodes[0].classList.add('backgroundColorTheme');
      }
      if (e.type === 'after.lory.init') {
        for (let i = 0, len = dot_count; i < len; i++) {
          if (!dot_container.childNodes[i]) return;
          dot_container.childNodes[i].addEventListener('click', function(e) {
            dot_navigation_slider.slideTo(Array.prototype.indexOf.call(dot_container.childNodes, e.target));
          });
        }
      }
      if (e.type === 'after.lory.slide') {
        for (let i = 0, len = dot_container.childNodes.length; i < len; i++) {
          dot_container.childNodes[i].classList.remove('backgroundColorTheme');
        }
        dot_container.childNodes[e.detail.currentSlide].classList.add('backgroundColorTheme');
        localStorage.setItem('currentSlide', e.detail.currentSlide);
        // console.log(dot_navigation_slider.returnIndex());
      }
      if (e.type === 'on.lory.resize') {
        for (let i = 0, len = dot_container.childNodes.length; i < len; i++) {
          dot_container.childNodes[i].classList.remove('backgroundColorTheme');
        }
        dot_container.childNodes[0].classList.add('backgroundColorTheme');
      }
    };

    simple_dots.addEventListener('before.lory.init', handleDotEvent);
    simple_dots.addEventListener('after.lory.init', handleDotEvent);
    simple_dots.addEventListener('after.lory.slide', handleDotEvent);
    simple_dots.addEventListener('on.lory.resize', handleDotEvent);

    setTimeout(() => {
      let dot_tabs = simple_dots.querySelector('.js_dots').childNodes;
      for (let i = 0; i < dot_tabs.length; i++) {
        if (!this.state.pages[i]) return;
        dot_tabs[i].innerHTML = this.state.pages[i].title;
      }
    }, 1);

    let dot_navigation_slider = lory(simple_dots, {
      infinite: 0,
      enableMouseEvents: true
    });
    // console.log(dot_navigation_slider.returnIndex(), parseInt(slideIndex));
    // document
    // .getElementById("cover")
    // .classList.replace("hide-cover", "show-cover");

    // if (dot_navigation_slider.returnIndex() === parseInt(slideIndex)) {
    // return;
    // } else {
    dot_navigation_slider.slideTo(parseInt(slideIndex));
    // setTimeout(() => {
    //   document
    //     .getElementById("cover")
    //     .classList.replace("show-cover", "hide-cover");
    // }, 150);
    // }
  }

  renderPages() {
    console.count('page render');
    // console.log('page length', this.state.pages.length);
    if (this.state.pages.length === 0) {
      // console.log(this);
      // this.fetch();
      return;
    }
    let pages = [];
    if (document.querySelector('.js_slides')) {
      // console.log('clear');
      document.querySelector('.js_slides').innerHTML = '';
    }

    if (document.querySelector('.js_dots')) {
      let dots = document.querySelector('.js_dots');
      if (dots.childElementCount > this.state.pages.length) {
        while (dots.childElementCount > 0) {
          dots.removeChild(dots.firstChild);
        }
      }
    }
    // if (this.state.pages.length === 0) return;
    this.state.pages.forEach(page => {
      if (!page.backgroundColor.solid) return;
      page.backgroundColor.colorType === 'solid' ? (page.backgroundColor = page.backgroundColor.solid.backgroundCSS) : (page.backgroundColor = page.backgroundColor.gradient.backgroundCSS);

      pages.push(<Page index={this.state.pages.indexOf(page)} data={page} />);
    });

    setTimeout(() => this.loryFormat(), 1);
    return pages;
  }

  listener() {
    db.onUpdate(snapshot => {
      // console.log(snapshot);
      switch (snapshot.tag) {
        case 'pages': {
          this.setState({ pages: snapshot.data.pages });
          break;
        }
        default:
          return;
      }
    });
  }

  fetch() {
    db.get('pages', (err, response) => {
      if (err) throw err;
      // console.log(response);
      // if none are present, insert a default page
      if (!response.id) {
        // this.setState({
        //   pages: [
        //     {
        //       title: 'new page',
        //       header: 'new page',
        //       desc: 'edit this page in the control',
        //       plugins: []
        //     }
        //   ]
        // });
        return;
      } else {
        // if (this.state.pages.length === 0) return;
        this.setState({ pages: response.data.pages });
      }
    });
  }

  componentDidUpdate() {
    // this.render();
    // console.log(this.state);
    // window.location.reload();
  }

  componentDidMount() {
    // this.fetch();
    // document
    // .getElementById("cover")
    // .classList.replace("hide-cover", "show-cover");
    this.listener();
  }

  render() {
    return (
      <div key={Date.now()} id="container foo backgroundColorTheme">
        <div id="cover" className="hide-cover">
          <div className="loader" />
        </div>
        <div id="sandbox">
          <div key={Date.now()} className="slider js_simple_dots simple">
            <ul key={Date.now()} className="dots js_dots sticky defaultBackgroundTheme titleBarTextAndIcons" id="dot-nav" />
            <div className="frame js_frame">
              <ul className="slides js_slides">{this.renderPages()}</ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Widget;
