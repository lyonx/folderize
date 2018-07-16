import React, { Component } from "react";
let db = buildfire.datastore;

class Page extends Component {
  constructor(props) {
    super(props);
    this.updatePage = props.updatePage;
    this.deletePage = props.deletePage;
    this.key = props.key;
    // this.modal = document.createElement("div");
    this.update = this.update.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.delete = this.delete.bind(this);
    this.state = {
      title: props.title,
      plugins: props.plugins,
      header: props.header,
      desc: props.desc
    };
  }

  initSortable() {
    let selector = `#plugins${this.key}`;
    let plugins = new buildfire.components.pluginInstance.sortableList(
      selector,
      [],
      { showIcon: true, confirmDeleteItem: false },
      undefined,
      undefined,
      { itemEditable: true, navigationCallback: () => console.log("nav cb") }
    );

    plugins.loadItems(this.state.plugins);
    // db.get("plugins", (err, response) => {
    //   if (err) throw err;
    //   console.log(response);
    //   plugins.loadItems(response.data.plugins);
    //   if (!response.id) {
    //     db.insert(
    //       { plugins: plugins.items },
    //       "plugins",
    //       true,
    //       (err, status) => {
    //         if (err) {
    //           console.log("insert err");
    //           throw err;
    //         }
    //         console.log(status);
    //       }
    //     );
    //   }
    // });

    // plugins.loadItems(plugins.items, null);

    plugins.onAddItems = () => {
      this.setState({
        plugins: plugins.items
      });
    };

    //   db.get("plugins", (err, response) => {
    //     if (err) throw err;
    //     console.log(response);
    //     if (!response.id) {
    //       db.insert(
    //         { plugins: plugins.items },
    //         "plugins",
    //         true,
    //         (err, status) => {
    //           if (err) {
    //             console.log("insert err");
    //             throw err;
    //           }
    //           console.log(status);
    //         }
    //       );
    //     } else {
    //       db.update(
    //         response.id,
    //         { plugins: plugins.items },
    //         "plugins",
    //         (err, status) => {
    //           if (err) throw err;
    //           console.log(status);
    //         }
    //       );
    //     }
    //   });
    // };

    // plugins.onDeleteItem = () => {
    //   db.get("plugins", (err, response) => {
    //     if (err) throw err;
    //     console.log(response);
    //     if (!response.id) {
    //       db.insert(
    //         { plugins: plugins.items },
    //         "plugins",
    //         true,
    //         (err, status) => {
    //           if (err) {
    //             console.log("insert err");
    //             throw err;
    //           }
    //           console.log(status);
    //         }
    //       );
    //     } else {
    //       db.update(
    //         response.id,
    //         { plugins: plugins.items },
    //         "plugins",
    //         (err, status) => {
    //           if (err) throw err;
    //           console.log(status);
    //         }
    //       );
    //     }
    //   });
    // };

    // plugins.onOrderChange = () => {
    //   db.get("plugins", (err, response) => {
    //     if (err) throw err;
    //     console.log(response);
    //     if (!response.id) {
    //       db.insert(
    //         { plugins: plugins.items },
    //         "plugins",
    //         true,
    //         (err, status) => {
    //           if (err) {
    //             console.log("insert err");
    //             throw err;
    //           }
    //           console.log(status);
    //         }
    //       );
    //     } else {
    //       db.update(
    //         response.id,
    //         { plugins: plugins.items },
    //         "plugins",
    //         (err, status) => {
    //           if (err) throw err;
    //           console.log(status);
    //         }
    //       );
    //     }
    //   });
    // };
  }

  delete() {
    this.deletePage(this.key);
  }

  update() {
    console.log(this);
    this.updatePage(this.key, {
      title: this.state.title,
      plugins: this.state.plugins,
      header: this.state.header,
      desc: this.state.desc
    });
  }

  edit() {}

  handleChange(event) {
    console.log("handlechange");
    const target = event.target;
    const name = target.name;
    this.setState({ [name]: event.target.value });
  }

  componentDidMount() {
    this.initSortable();
  }

  componentDidUpdate() {
    console.log(this.state);
  }

  render() {
    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">{this.props.title}</h3>
          </div>
          <div className="panel-body">
            <div className="container">
              <div className="row">
                <div className="col-sm-12">
                <form>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      aria-describedby="sizing-addon2"
                      value={this.state.title}
                      onChange={this.handleChange}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      name="header"
                      aria-describedby="sizing-addon2"
                      value={this.state.header}
                      onChange={this.handleChange}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      name="desc"
                      aria-describedby="sizing-addon2"
                      value={this.state.desc}
                      onChange={this.handleChange}
                    />
                  </div>
                </form>
                </div>
                <div className="col-sm-12">
                  <div id={`plugins${this.key}`} />
                  <button className="btn btn-primary" onClick={this.delete}>
                    Delete Page
                  </button>
                  <button className="btn btn-primary" onClick={this.update}>
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Page;
