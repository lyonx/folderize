import React, { Component } from 'react';
import Page from './Components/Page';
import debounce from 'lodash.debounce';

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
    this.handleChange = this.handleChange.bind(this);
    this.renderPages = this.renderPages.bind(this);
    this.reorderPages = this.reorderPages.bind(this);
    this.debounceSync = debounce(this.syncState, 1000);
    this.state = {
      pages: [],
      layout: 1,
      styleOverrides: [{
        target: "dot-nav",
        data: {
          styles: [
            {
            attr: "position",
            value: "bottom"
            }
          ]
        }
      }]
    };
  }

  addStyleOverride(target, attr, value) {
    console.log(target, attr, value);
    let styleOverrides = this.state.styleOverrides;
    let index = -1;
    let style = styleOverrides.filter(style => {
      index = styleOverrides.indexOf(style);
      return style.target === target;
    });

    
    let currentStyle = style[0].data.styles.filter(e => {
      return e.attr === attr;
    });
    
    currentStyle[0].value = value;

    styleOverrides[index] = currentStyle;

    this.setState({ styleOverrides });
    
  }

  fetch() {
    // Control looks in db for any pages
    db.get('pages', (err, response) => {
      if (err) throw err;
      // if none are present, insert a default page
      if (!response.id) {
        this.setState({
          pages: [
            {
              title: 'new page',
              id: Date.now(),
              customizations: [],
              backgroundColor: {
                colorType: false,
                solid: {
                  backgroundCSS: "",
                },
                gradient: {
                  backgroundCSS: "",
                }
              },
              nodes: [
                {
                  type: 'header',
                  data: {
                    text: 'new page'
                  }
                }
              ]
            }
          ]
        });
      } else {
        if (response.data.pages.length === 0) {
          this.setState({
            pages: [
              {
                title: 'New Page',
                id: Date.now(),
                customizations: [],
                backgroundColor: {
                  colorType: false,
                  solid: {
                    backgroundCSS: "",
                  },
                  gradient: {
                    backgroundCSS: "",
                  }
                },
                nodes: [
                  {
                    type: 'header',
                    data: {
                      text: 'new page'
                    }
                  }
                ]
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
    db.get('pages', (err, response) => {
      if (err) throw err;
      if (!response.id) {
        db.insert({ pages: this.state.pages }, 'pages', true, (err, status) => {
          if (err) throw err;
        });
        return;
      } else {
        // insert pages into db
        db.update(response.id, { pages: this.state.pages }, 'pages', (err, status) => {
          if (err) {
            throw err;
          }
        });
      }
    });
  }

  handleChange(event) {
    const target = event.target;
    const name = target.name;
    this.setState({ [name]: event.target.value });
  }

  renderPages() {
    let pages = [];
    this.state.pages.map(page => {
      pages.push(<Page index={this.state.pages.indexOf(page)} updatePage={this.updatePage} deletePage={this.deletePage} data={page} reorderPages={this.reorderPages} />);
    });
    return pages;
  }

  reorderPages(index, dir) {
    let pages = this.state.pages;
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
    // this.render();
    // window.location.reload();
  }

  addPage() {
    let newPage = {
      title: 'New Page',
      id: Date.now(),
      backgroundColor: {
        colorType: false,
        solid: {
          backgroundCSS: "",
        },
        gradient: {
          backgroundCSS: "",
        }
      },
      nodes: [
        {
          type: 'header',
          data: {
            text: 'new page'
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
    let pages = this.state.pages;
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
    // this.syncState();
    console.warn(this.state);
    this.debounceSync();
  }

  render() {
    console.count('render');
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Plugin Configuration</h3>
              </div>
              <div className="panel-body">
                <button className="btn btn-primary" onClick={this.addPage}>
                  Add a Page
                </button>
                <button onClick={e => {
                  this.addStyleOverride("dot-nav", "position", "top");
                }}>Move</button>
                {/* <form>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      name="text"
                      aria-describedby="sizing-addon2"
                      value={this.state.text}
                      onChange={this.handleChange}
                    />
                  </div>
                </form> */}
              </div>
            </div>
          </div>
          <div className="col-md-12" id="nodeDiv">
            {this.renderPages()}
          </div>
        </div>
      </div>
    );
  }
}

export default Content;
