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
			plugins: [],
			settings: {
				pages: [],
				styleOverrides: [],
				options: {
					navPosition: 'top',
					renderTitlebar: false,
				}
			},
			currentSlide: null
		};
	}

	loryFormat() {
		let slideIndex = localStorage.getItem('currentSlide');
		let pages = this.state.settings.pages;

		if (pages.length === 0) return;
		let simple_dots = document.querySelector('.js_simple_dots');
		alert(lory);
		alert(buildfire);

		let dot_count = pages.length;
		let dot_container = simple_dots.querySelector('.js_dots');
		let dot_list_item = document.createElement('li');

		const handleDotEvent = e => {
			alert(e.type);
			if (e.type === 'before.lory.init') {
				if (pages.length != this.state.settings.pages.length) return;
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
				console.log(dot_container.childNodes[e.detail.currentSlide]);

				dot_container.childNodes[e.detail.currentSlide].classList.add('backgroundColorTheme');
				localStorage.setItem('currentSlide', e.detail.currentSlide);
				// console.log(dot_navigation_slider.returnIndex());
			}
			if (e.type === 'on.lory.resize') {
				for (let i = 0, len = dot_container.childNodes.length; i < len; i++) {
					dot_container.childNodes[i].classList.remove('backgroundColorTheme');
				}
				if (!dot_container.childNodes[0]) return;
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
				if (!this.state.settings.pages[i]) return;
				console.log(this.state.settings.pages[i].iconUrl);
				if (this.state.settings.pages[i].iconUrl) {
					if (this.state.settings.pages[i].iconUrl === '') return;
					let icon = document.createElement('span');
					let url = this.state.settings.pages[i].iconUrl.split(' ');
					icon.classList.add(`${url[0]}`);
					icon.classList.add(`${url[1]}`);
					// icon.classList.add(`${this.state.settings.pages[i].iconUrl}`);
					dot_tabs[i].appendChild(icon);
				} else {
					dot_tabs[i].innerHTML = this.state.settings.pages[i].title;
				}
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
		// console.log('page length', this.state.settings.pages.length);
		if (this.state.settings.pages.length === 0) {
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
			if (dots.childElementCount > this.state.settings.pages.length) {
				while (dots.childElementCount > 0) {
					dots.removeChild(dots.firstChild);
				}
			}
		}
		// if (this.state.settings.pages.length === 0) return;
		this.state.settings.pages.forEach(page => {
			if (!page.backgroundColor.solid) return;
			page.backgroundColor.colorType === 'solid' ? (page.backgroundColor = page.backgroundColor.solid.backgroundCSS) : (page.backgroundColor = page.backgroundColor.gradient.backgroundCSS);

			pages.push(<Page index={this.state.settings.pages.indexOf(page)} data={page} />);
		});

		setTimeout(() => this.loryFormat(), 1);
		return pages;
	}

	applyStyles() {
		let styles = this.state.settings.styleOverrides;
		console.log(styles);
		if (styles.length === 0) return;
		styles.forEach(style => {
			console.warn(style);
			let target = document.getElementById(style.target);
			console.log(target);
		});
	}

	listener() {
		db.onUpdate(snapshot => {
			console.log(snapshot);
			switch (snapshot.tag) {
				case 'pages': {
					// this.setState({ pages: snapshot.data.pages });
					break;
				}
				case 'master': {
					this.setState({ settings: snapshot.data.settings });
					break;
				}
				default:
					return;
			}
		});
	}

	fetch() {
		db.get('master', (err, response) => {
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
				// if (this.state.settings.pages.length === 0) return;
				this.setState({ settings: response.data.settings });
			}
		});
	}

	componentDidUpdate() {
		console.warn(this.state);
		// this.state.settings.options.renderTitlebar === true ? console.log(this.state.settings.options.renderTitlebar) : console.log(this.state.settings.options.renderTitlebar);
		this.state.settings.options.renderTitlebar === true ? buildfire.appearance.titlebar.show() : buildfire.appearance.titlebar.hide();
		// this.applyStyles();
	}

	componentDidMount() {
		this.fetch();
		console.log(window.location.pathname);
		if (window.location.pathname.indexOf('/widget/') === 0) {
			buildfire.getContext(function(err, context) {
				if (err) {
					console.error(err);
				} else {
					if (context && context.debugTag) buildfire.logger.attachRemoteLogger(context.debugTag);
					if (window.location.pathname.indexOf('/widget/') === 0) {
						var disableTheme = buildfire.options && buildfire.options.disableTheme ? buildfire.options.disableTheme : false;

						if (!disableTheme) {
							if (buildfire.isWeb() || !context.liveMode) buildfire.appearance.attachAppThemeCSSFiles(context.appId, context.liveMode, context.endPoints.appHost);
							else buildfire.appearance.attachLocalAppThemeCSSFiles(context.appId);
						}
					}
				}
			});
		}
		// document
		// .getElementById("cover")
		// .classList.replace("hide-cover", "show-cover");
		this.listener();
	}

	render() {
		let dotNav = <ul key={Date.now()} className="dots js_dots sticky defaultBackgroundTheme titleBarTextAndIcons" id="dot-nav" />;
		return (
			<div key={Date.now()} id="container foo backgroundColorTheme">
				<div id="cover" className="hide-cover">
					<div className="loader" />
				</div>
				<div id="sandbox">
					{/* {this.state.settings.options.showTitleBar ? <div className="title-bar">Title Bar</div> : <div/>} */}
					<div key={Date.now()} className="slider js_simple_dots simple">
						{this.state.settings.options.navPosition === 'top' ? dotNav : null }
						<div className="frame js_frame">
							<ul className="slides js_slides">{this.renderPages()}</ul>
						</div>
						{this.state.settings.options.navPosition === 'bottom' ? dotNav : null }
					</div>
				</div>
			</div>
		);
	}
}

export default Widget;
