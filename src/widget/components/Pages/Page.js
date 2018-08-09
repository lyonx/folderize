import React, { Component } from 'react';
import Lazyload from 'react-lazy-load';

// --------------------------- WIDGET PAGE COMPONENT --------------------------- //
class Page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			title: props.data.title,
			nodes: [],
			show: false,
			backgroundColor: '',
			backgroundImg: ''
		};
	}

	// PLUGIN NAVIGATION HANDLER
	pluginNav(node) {
		buildfire.navigation.navigateTo({
			pluginId: node.data.pluginTypeId,
			instanceId: node.data.instanceId,
			folderName: node.data._buildfire.pluginType.result[0].folderName,
			title: node.data.title
		});
	}

	// LOOPS THROUGH THE NODES AND RETURNS ELEMENTS OF THE CORRESPONDING TYPE
	renderNodes() {
		let nodes = [];
		if (!this.props.data.nodes) return;
		this.props.data.nodes.forEach(node => {
			if (!node) return;
			switch (node.type) {
				case 'header': {
					nodes.push(
						<div className="col-sm-12">
							<div className="page-header">
								<h1>{node.data.text}</h1>
							</div>
						</div>
					);
					break;
				}
				case 'desc': {
					nodes.push(
						<div className="col-sm-12">
							<p className="description">{node.data.text}</p>
						</div>
					);
					break;
				}
				case 'image': {
					nodes.push(
						<div className="col-sm-12">
							<div className="image-wrap">
								<Lazyload offsetHorizontal={50} height={200}>
									<div className="images" style={`background: url(${node.data.src})`} />
								</Lazyload>
							</div>
						</div>
					);
					break;
				}
				case 'plugin': {
					if (!node.data) return;
					nodes.push(
						<div className="col-sm-12">
							<div className="plugin" onClick={e => this.pluginNav(node)}>
								<div className="plugin-thumbnail" style={`background: url("${node.data.iconUrl}")`} alt="..." />
								<h3 className="plugin-title">{node.data.title}</h3>
							</div>
						</div>
					);
					break;
				}
				case 'action': {
					if (!node.data) return;
					nodes.push(
						<div className="col-sm-12">
							<div
								className="plugin"
								onClick={e => {
									buildfire.actionItems.execute(node.data, (err, res) => {
										if (err) throw err;
									});
								}}>
								<div className="plugin-thumbnail" style={`background: url("${node.data.iconUrl}")`} alt="..." />
								<h3 className="plugin-title">{node.data.title}</h3>
							</div>
						</div>
					);
					break;
				}
				case 'hero': {
					if (!node.data) return;
					nodes.push(
						<div className="col-sm-12">
							<div className="hero">
								<div className="hero-img" style={`background: url("${node.data.src}")`} alt="...">
									<div className="hero-text">
										<h1>{node.data.header}</h1>
										{node.data.subtext.length > 0 ? <p>{node.data.subtext}</p> : null}
									</div>
								</div>
								{/* <h3 className="plugin-title">{node.data.title}</h3> */}
							</div>
						</div>
					);
					break;
				}
				default:
					return;
			}
		});
		return nodes;
	}

	// ON MOUNT, MOVE DATA TO STATE
	componentDidMount() {
		this.setState({ data: this.props.data });
		let getOffest = e => {
			setTimeout(() => {
				// console.warn(document.querySelector(`#slide${this.props.index}`).offsetLeft);
				let x = document.querySelector(`#slide${this.props.index}`).getBoundingClientRect().x;
				// console.log(this.props.index, x, window.scrollX);
				this.setState({
					offset: Math.abs(x)
				});
			}, 250);
		};
		// document.removeEventListener('after.lory.slide', getOffest);
		document.addEventListener('after.lory.slide', getOffest);
	}

	render() {
		let content = <div className="container-fluid page-content" style={`${this.props.data.backgroundColor} !important`}>
		<div className="row">{this.renderNodes()}</div>
	</div>;
		return (
			<li className="js_slide" index={this.props.index} id={`slide${this.props.index}`} style={`background: url("${this.props.data.backgroundImg}")`}>
			{this.state.offset > window.innerWidth + 100 ? null : content}
			</li>
		);
	}
}

export default Page;
