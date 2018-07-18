import React, { Component } from "react";
import Page from "./Components/Page";

let buildfire = window.buildfire;
let tinymce = window.tinymce;
let db = buildfire.datastore;

class Content extends Component {
  constructor(props) {
    super(props);
    this.addPage = this.addPage.bind(this);
    this.deletePage = this.deletePage.bind(this);
    this.addImg = this.addImg.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.renderPages = this.renderPages.bind(this);
    this.reorderPages = this.reorderPages.bind(this);
    this.state = {
      pages: [],
      text: "",
      image:
        "https://images.unsplash.com/photo-1519636243899-5544aa477f70?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjQ0MDV9&s=6c937b3dbd83210ac77d8c591265cdf8"
    };
  }

  fetch() {
    // Control looks in db for any pages
    db.get("pages", (err, response) => {
      if (err) throw err;
      //   console.log(response);
      // if none are present, insert a default page
      if (!response.id) {
        this.setState({
          pages: [
            {
              title: "new page",
              // header: "new page",
              // desc: "edit this page in the control",
              nodes: [
                {
                  type: "header",
                  data: {
                    text: "new page"
                  }
                }
              ],
              plugins: [],
              images: []
            }
          ]
        });
      } else {
        if (response.data.pages.length === 0) {
          this.setState({
            pages: [
              {
                title: "New Page",
                // header: "Example Header",
                // desc: "Edit this page in the control",
                nodes: [
                  {
                    type: "header",
                    data: {
                      text: "new page"
                    }
                  }
                ],
                plugins: [],
                images: []
              }
            ]
          });
        } else {
          this.setState({ pages: response.data.pages });
        }
      }
    });
    db.get("image", (err, response) => {
      if (err) throw err;
      //   console.log(response);
      // if none are present, insert a default page
      if (!response.id) {
        this.setState({
          image:
            "https://images.unsplash.com/photo-1519636243899-5544aa477f70?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjQ0MDV9&s=6c937b3dbd83210ac77d8c591265cdf8"
        });
      }
      {
        this.setState({ image: response.data.image });
      }
    });
  }

  syncState() {
    // when a state change is detected,
    // console.log(this.state);
    db.get("pages", (err, response) => {
      if (err) throw err;
      //   console.log(response);
      if (!response.id) {
        db.insert({ pages: this.state.pages }, "pages", true, (err, status) => {
          if (err) throw err;
          //   console.log(status);
        });
        return;
      } else {
        // insert pages into db
        db.update(
          response.id,
          { pages: this.state.pages },
          "pages",
          (err, status) => {
            if (err) {
              throw err;
            }
            // console.log(status);
          }
        );
      }
    });
    db.get("image", (err, response) => {
      if (err) throw err;
      //   console.log(response);
      if (!response.id) {
        db.insert({ image: this.state.image }, "image", true, (err, status) => {
          if (err) throw err;
          //   console.log(status);
        });
        return;
      } else {
        // insert pages into db
        db.update(
          response.id,
          { image: this.state.image },
          "image",
          (err, status) => {
            if (err) {
              throw err;
            }
            // console.log(status);
          }
        );
      }
    });
  }

  renderPages() {
    let pages = [];
    this.state.pages.map(page => {
      console.warn(this.state.pages.indexOf(page));
      pages.push(
        <Page
          index={this.state.pages.indexOf(page)}
          updatePage={this.updatePage}
          deletePage={this.deletePage}
          data={page}
          reorderPages={this.reorderPages}
        />
      );
    });
    return pages;
  }

  reorderPages(index, dir) {
    let pages = this.state.pages;
    console.log(pages, index, dir);
    // let target = pages[index];

    if (dir === 1) {
      let temp = pages[index - 1];
      if (!temp) return;
      pages[index - 1] = pages[index];
      pages[index] = temp;
      this.setState({ pages });
    } else {
      let temp = pages[index + 1];
      if (!temp) return;
      pages[index + 1] = pages[index];
      pages[index] = temp;
      this.setState({ pages });
    }
    this.render();
  }

  addPage() {
    let newPage = {
      title: "New Page",
      plugins: [],
      images: [],
      nodes: [
        {
          type: "header",
          data: {
            text: "new page"
          }
        }
      ]
    };
    let pages = this.state.pages;
    pages.push(newPage);
    this.setState({ pages: pages });
  }

  addImg() {
    buildfire.imageLib.showDialog({}, (err, result) => {
      if (err) throw err;
      this.setState({ image: result.selectedFiles[0] });
    });
  }

  deletePage(index) {
    let pages = this.state.pages;
    pages.splice(index, 1);
    this.setState({ pages: pages });
  }

  updatePage(index, page) {
    // console.log(index, page);
    let pages = this.state.pages;
    // console.log(pages);
    pages[index] = page;
    this.setState({ pages: pages });
  }

  componentDidMount() {
    // Control looks in db for any pages
    this.fetch();
    // this.initSortable();
    // this.mceInit();
  }

  componentDidUpdate() {
    this.syncState();
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Add Page</h3>
              </div>
              <div className="panel-body">
                <button className="btn btn-primary" onClick={this.addPage}>
                  Add a Page
                </button>
                <button className="btn btn-primary" onClick={this.addImg}>
                  Add an Image
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-12">{this.renderPages()}</div>
        </div>
      </div>
    );
  }
}

export default Content;
