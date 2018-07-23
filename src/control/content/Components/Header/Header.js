import React, { Component } from "react";

class Header extends Component {
  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading tab">
          <h3 className="panel-title tab-title">Header</h3>
          <div className="toggle-group">
            <button
              className="btn btn-deafult tab-toggle"
              onClick={e => this.reorderNodes(this.props.node.index, 1)}
            >
              <span
                className="glyphicon glyphicon-chevron-up"
                aria-hidden="true"
              />
            </button>
            <button
              className="btn btn-deafult tab-toggle"
              onClick={e => this.reorderNodes(this.props.node.index, 0)}
            >
              <span
                className="glyphicon glyphicon-chevron-down"
                aria-hidden="true"
              />
            </button>
            <button
              className="btn btn-deafult tab-toggle"
              id={`page${this.props.index}node${this.props.node.index}`}
              index={`${this.props.node.index}`}
              page={`${this.props.index}`}
              onClick={e => this.toggle(e, "node")}
            >
              Edit
            </button>
          </div>
        </div>
        <div
          className="panel-body panel-hide"
          data-toggle="hide"
          id={`page${this.props.index}nodepanel${this.props.node.index}`}
        >
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              name="heading"
              aria-describedby="sizing-addon2"
              value={this.props.node.data.text}
              onChange={e =>
                this.handleNodeChange(
                  e,
                  this.props.data.nodes.indexOf(this.props.nodenode),
                  "text"
                )
              }
            />
          </div>
          <button
            className="btn btn-danger"
            onClick={e =>
              this.handleNodeChange(
                e,
                this.props.data.nodes.indexOf(node),
                "delete"
              )
            }
          >
            Remove
          </button>
        </div>
      </div>
    );
  }
}
