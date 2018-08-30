import React, { Component } from 'react';

export default class Header extends Component {
	render() {
		let border;
		this.props.data.border ? (border = '') : (border = `border-bottom: 0px !important;`);
		return (
			<div className="col-sm-12">
				<div className="page-header" style={border}>
					<h1 style={`font-size: ${this.props.data.headerFontSize}px`}>{this.props.data.text}</h1>
				</div>
			</div>
		);
	}
}
