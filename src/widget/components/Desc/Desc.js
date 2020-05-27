import React, { Component } from 'react';

export default class Desc extends Component {
	render() {
		return (
			<div className="col-sm-12">
				<p className="description" style={`font-size: ${this.props.data.bodyFontSize}px`}>
					{this.props.data.text}
				</p>
			</div>
		);
	}
}
