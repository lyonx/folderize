import React, { Component } from "react";

class Slides extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plugins: [],
      slideIndex: 0
    };
  }

  plusDivs(n) {
    let index = this.state.slideIndex;
    this.showDivs(this.setState({ slideIndex: (index += n) }));
  }

  showDivs(n) {
    let index = this.state.slideIndex;
    // let i;
    // let x = document.getElementsByClassName("slide");
    // let dots = document.getElementsByClassName("demo");
    // if (n > x.length) {
    //   index = 1;
    //   this.setState({ slideIndex: index });
    // }
    // if (n < 1) {
    //   index = x.length;
    //   this.setState({ slideIndex: index });
    // }
    // for (i = 0; i < x.length; i++) {
    //   x[i].style.display = "none";
    // }
    // for (i = 0; i < dots.length; i++) {
    //   dots[i].className = dots[i].className.replace(" w3-red", "");
    // }
    // x[index - 1].style.display = "block";
    // dots[index - 1].className += " w3-red";
  }

  render() {
    return (
      
    );
  }
}

export default Slides;
