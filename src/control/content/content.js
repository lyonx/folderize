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
    this.updatePage = this.updatePage.bind(this);
    this.renderPages = this.renderPages.bind(this);
    this.state = {
      pages: [],
      text: "",
      img: ""
    };
  }

  fetch() {
    // Control looks in db for any pages
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
        if (response.data.pages.length === 0) {
          this.setState({
            pages: [
              {
                title: "New Page",
                header: "Example Header",
                desc: "Edit this page in the control",
                plugins: []
              }
            ]
          });
        } else {
          this.setState({ pages: response.data.pages });
        }
      }
    });
  }

  syncState() {
    // when a state change is detected,
    console.log(this.state);
    db.get("pages", (err, response) => {
      if (err) throw err;
      // console.log(response);
      if (!response.id) {
        return;
      } else {
        // insert pages into db
        db.update(
          response.id,
          { pages: this.state.pages },
          "pages",
          (err, status) => {
            if (err) throw err;
            console.log(status);
          }
        );
      }
    });
  }

  renderPages() {
    let pages = [];
    this.state.pages.map(page => {
      pages.push(
        <Page
          key={this.state.pages.indexOf(page)}
          deletePage={this.deletePage}
          updatePage={this.updatePage}
          title={page.title}
          header={page.header}
          desc={page.desc}
          plugins={page.plugins}
        />
      );
    });
    return pages;
  }

  addPage() {
    let newPage = {
      title: "New Page",
      header: "Example Header",
      desc: "Edit this page in the control",
      plugins: []
    };
    let pages = this.state.pages;
    pages.push(newPage);
    this.setState({ pages: pages });
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
