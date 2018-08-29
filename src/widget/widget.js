import React, { Component } from 'react';
import Page from './components/Pages/Page';

buildfire.spinner.show();
class Widget extends Component {
	constructor(props) {
		super(props);
		this.renderPages = this.renderPages.bind(this);
		this.handleDotEvent = this.handleDotEvent.bind(this);
		this.dot_container = null;
		this.slider = null;
		this.state = {
			plugins: [],
			settings: {
				pages: [],
				options: {
					backgroundImg: '',
					backgroundLrg: '',
					textAlign: 'left',
					navPosition: 'top',
					navShadow: false,
					renderTitlebar: false
				}
			},
			currentSlide: null
		};
	}

	// ----------------------- LIFECYCLE METHODS ----------------------- //

	// ON MOUNT FETCHES DATA AND INITIALIZES DB LISTENERS
	componentDidMount() {
		console.warn(this.state);
		
		// GET ANY PREVIOUSLY STORED DATA
		this.fetch();
		// INITIALIZE THE DB LISTENER
		this.listener();

		// COMPENSATES FOR CSS INJECTION BUG IN REACT TEMPLATE (BUILDFIRE.JS:1891)
		if (window.location.pathname.indexOf('/widget/') === 0) {
			buildfire.getContext(function(err, context) {
				if (err) throw err;
				if (context && context.debugTag) buildfire.logger.attachRemoteLogger(context.debugTag);
				if (window.location.pathname.indexOf('/widget/') === 0) {
					var disableTheme = buildfire.options && buildfire.options.disableTheme ? buildfire.options.disableTheme : false;

					if (!disableTheme) {
						if (buildfire.isWeb() || !context.liveMode) buildfire.appearance.attachAppThemeCSSFiles(context.appId, context.liveMode, context.endPoints.appHost);
						else buildfire.appearance.attachLocalAppThemeCSSFiles(context.appId);
					}
				}
			});
		}
		buildfire.spinner.hide();

		setTimeout(() => {
			try {
				let activeSlide = document.querySelector('.js_slide.active');
				if (!activeSlide) return;
				console.log(activeSlide);

				activeSlide.addEventListener('scroll', e => {
					// console.log(e.target.scrollTop);
					localStorage.setItem('scroll', e.target.scrollTop);
				});
				let scrollHeight = localStorage.getItem('scroll');
				console.log(typeof scrollHeight);
				let scrollOptions = {
					top: parseInt(scrollHeight),
					left: 0,
					behavior: 'instant'
				};
				if (scrollHeight) activeSlide.scrollTo(scrollOptions);
			} catch (err) {
				console.warn(err);
			}
		}, 400);
	}
	// GETS LAYOUTS AND OPTIONALLY RENDERS BUILDFIRE TITLEBAR
	componentDidUpdate() {
		console.warn(this.state);

		this.getLayouts();
		this.state.settings.options.renderTitlebar === true ? buildfire.appearance.titlebar.show() : buildfire.appearance.titlebar.hide();
		if (document.querySelector('.hero-img')) {
			this.state.settings.pages.length === 1 ? document.querySelector('.hero-img').classList.add('full') : null;
		}

		setTimeout(() => {
			try {
				let activeSlide = document.querySelector('.js_slide.active');
				if (!activeSlide) return;
				activeSlide.addEventListener('scroll', e => {
					// console.log(e.target.scrollTop);
					localStorage.setItem('scroll', e.target.scrollTop);
				});

				let scrollHeight = localStorage.getItem('scroll');
				console.log(typeof scrollHeight);
				let scrollOptions = {
					top: parseInt(scrollHeight),
					left: 0,
					behavior: 'instant'
				};
				scrollHeight ? activeSlide.scrollTo(scrollOptions) : null;
			} catch (err) {
				console.error(err);
			}
		}, 25);
	}

	// ------------------------- DATA HANDLING ------------------------- //

	// UPDATES THE STATE WHEN DB UPDATES
	listener() {
		buildfire.datastore.onUpdate(snapshot => {
			switch (snapshot.tag) {
				case 'pages': {
					// this.setState({ pages: snapshot.data.pages });
					break;
				}
				case 'data': {
					this.setState({ settings: snapshot.data.settings });
					break;
				}
				default:
					return;
			}
		});
		buildfire.messaging.onReceivedMessage = message => {
			if (message.color) {
				document.querySelector('#sandbox').setAttribute('style', message.color);
			} else {
				if (message.nodeIndex || message.nodeIndex === 0) {
					let slide = document.querySelector(`#slide${message.pageIndex}`);
					let nodes = slide.childNodes[0].childNodes[0].childNodes;
					let node = nodes[message.nodeIndex];

					let activeSlide = document.querySelector('.js_slide.active');

					let scrollOptions = {
						top: parseInt(node.offsetTop),
						left: 0,
						behavior: 'smooth'
					};

					activeSlide.scrollTo(scrollOptions);

					if (localStorage.getItem('currentSlide') != message.pageIndex) this.slider.slideTo(message.pageIndex);

					node.classList.add('focus');
					setTimeout(() => {
						node.classList.remove('focus');
					}, 1000);
					return;
				}
				if (this.state.settings.pages.length === 0) return;
				this.slider.slideTo(message.index);
			}
		};
	}
	// FETCHES DATA FROM DB, IMPORTANT WHEN WIDGET IS DEPLOYED
	fetch() {
		buildfire.datastore.get('data', (err, response) => {
			if (err) throw err;

			// IF NO ENTRIES ARE FOUND, RETURN FOR NOW
			if (!response.id) return;

			// OTHERWISE LOAD THE SETTINGS
			this.setState({ settings: response.data.settings });
		});
	}
	// BOUND EVENT HANDLER, CONTROLS DOT NAVIGATION
	handleDotEvent(e) {
		let dot_list_item = document.createElement('li');
		let dot_count = this.state.settings.pages.length;
		let pages = this.state.settings.pages;
		if (e.type === 'before.lory.init') {
			if (pages.length != this.state.settings.pages.length) return;
			for (let i = 0, len = dot_count; i < len; i++) {
				let clone = dot_list_item.cloneNode();
				if (this.dot_container.childNodes.length >= pages.length) return;

				this.dot_container.appendChild(clone);
			}
			this.dot_container.childNodes[0].classList.add('active');
		}
		if (e.type === 'after.lory.init') {
			for (let i = 0, len = dot_count; i < len; i++) {
				if (!this.dot_container.childNodes[i]) return;
				this.dot_container.childNodes[i].addEventListener('click', e => {
					this.slider.slideTo(Array.prototype.indexOf.call(this.dot_container.childNodes, e.target));
				});
			}
		}
		if (e.type === 'after.lory.slide') {
			for (let i = 0, len = this.dot_container.childNodes.length; i < len; i++) {
				this.dot_container.childNodes[i].classList.remove('active');
			}
			let target = this.dot_container.childNodes[e.detail.currentSlide];
			if (!target) return;
			target.classList.add('active');
			localStorage.setItem('currentSlide', e.detail.currentSlide);
		}
		if (e.type === 'on.lory.resize') {
			for (let i = 0, len = this.dot_container.childNodes.length; i < len; i++) {
				this.dot_container.childNodes[i].classList.remove('active');
			}
			if (!this.dot_container.childNodes[0]) return;
			this.dot_container.childNodes[0].classList.add('active');
		}
	}
	// GETS AND APPLYS LAYOUT STYLING
	getLayouts() {
		let layout = this.state.settings.options.layout;
		let slider = document.querySelector('.js_simple_dots');
		let currentClassList = slider.classList;
		if (currentClassList.item(currentClassList.length - 1).includes('layout')) {
			slider.classList.replace(currentClassList.item(currentClassList.length - 1), `layout${layout}`);
		} else {
			slider.classList.add(`layout${layout}`);
		}
	}
	// REINITIALIZES THE SLIDER AND NAV ON INIT OR AFTER DOM CHANGE
	loryFormat() {
		this.dot_container = document.querySelector('.js_simple_dots').querySelector('.js_dots');
		// PREVENT ACCIDENTAL FORMATS
		if (this.state.settings.pages === 0) return;
		let pages = this.state.settings.pages;

		// QUERY SELECTORS
		let slideIndex = localStorage.getItem('currentSlide');
		let simple_dots = document.querySelector('.js_simple_dots');
		let dot_container = simple_dots.querySelector('.js_dots');
		// let dot_list_item = document.createElement('li');
		// let dot_count = pages.length;

		// EVENT HANDLER FOR NAV
		// const handleDotEvent = e => {
		// 	if (e.type === 'before.lory.init') {
		// 		if (pages.length != this.state.settings.pages.length) return;
		// 		for (let i = 0, len = dot_count; i < len; i++) {
		// 			let clone = dot_list_item.cloneNode();
		// 			if (dot_container.childNodes.length >= pages.length) return;

		// 			dot_container.appendChild(clone);
		// 		}
		// 		dot_container.childNodes[0].classList.add('active');
		// 	}
		// 	if (e.type === 'after.lory.init') {
		// 		for (let i = 0, len = dot_count; i < len; i++) {
		// 			if (!dot_container.childNodes[i]) return;
		// 			dot_container.childNodes[i].addEventListener('click', e => {
		// 				this.slider.slideTo(Array.prototype.indexOf.call(dot_container.childNodes, e.target));
		// 			});
		// 		}
		// 	}
		// 	if (e.type === 'after.lory.slide') {
		// 		for (let i = 0, len = dot_container.childNodes.length; i < len; i++) {
		// 			dot_container.childNodes[i].classList.remove('active');
		// 		}
		// 		dot_container.childNodes[e.detail.currentSlide].classList.add('active');
		// 		localStorage.setItem('currentSlide', e.detail.currentSlide);
		// 	}
		// 	if (e.type === 'on.lory.resize') {
		// 		for (let i = 0, len = dot_container.childNodes.length; i < len; i++) {
		// 			dot_container.childNodes[i].classList.remove('active');
		// 		}
		// 		if (!dot_container.childNodes[0]) return;
		// 		dot_container.childNodes[0].classList.add('active');
		// 	}
		// };

		// IF THERE IS ONLY ONE PAGE, DONT BIND EVENT HANDLERS AND HIDE NAVBAR
		if (pages.length > 1) {
			dot_container.classList.remove('hide');
			// BIND HANDLERS
			simple_dots.removeEventListener('before.lory.init', this.handleDotEvent);
			simple_dots.removeEventListener('after.lory.init', this.handleDotEvent);
			simple_dots.removeEventListener('after.lory.slide', this.handleDotEvent);
			simple_dots.removeEventListener('on.lory.resize', this.handleDotEvent);

			simple_dots.addEventListener('before.lory.init', this.handleDotEvent);
			simple_dots.addEventListener('after.lory.init', this.handleDotEvent);
			simple_dots.addEventListener('after.lory.slide', this.handleDotEvent);
			simple_dots.addEventListener('on.lory.resize', this.handleDotEvent);
		} else {
			dot_container.classList.add('hide');
			document.getElementsByClassName('js_slide')[0].classList.add('full');
		}

		// SETS NAV LABELS
		setTimeout(() => {
			// if (this.state.navStyle === 'content') {
			let dot_tabs = simple_dots.querySelector('.js_dots').childNodes;
			for (let i = 0; i < dot_tabs.length; i++) {
				if (!this.state.settings.pages[i]) return;
				// IF THERE IS AN ICON, DISPLAY IT
				if (this.state.settings.pages[i].iconUrl) {
					if (this.state.settings.pages[i].iconUrl === '') return;
					let icon = document.createElement('span');
					let url = this.state.settings.pages[i].iconUrl.split(' ');
					icon.classList.add(`${url[0]}`);
					icon.classList.add(`${url[1]}`);
					icon.classList.add(`glyphicon`);
					dot_tabs[i].innerHTML = '';
					dot_tabs[i].appendChild(icon);
					// OTHERWISE SET TITLE
				} else {
					dot_tabs[i].classList.add(`titleBarTextAndIcons`);
					dot_tabs[i].innerHTML = this.state.settings.pages[i].title;
				}
			}
			// } else if (this.state.navStyle === 'dots') {
			// let dot_tabs = simple_dots.querySelector('.js_dots').childNodes;
			// for (let i = 0; i < dot_tabs.length; i++) {
			// 	if (!this.state.settings.pages[i]) return;

			// 		let icon = document.createElement('span');
			// 		dot_tabs[i].appendChild(icon);

			// }
			// }
		}, 1);

		// INITIALIZE THE SLIDER
		this.slider = lory(simple_dots, {
			infinite: 0,
			enableMouseEvents: true
		});

		// SLIDE TO THE LAST PAGE THE USER WAS ON
		setTimeout(() => {
			this.slider.slideTo(parseInt(slideIndex));
		}, 1);
	}

	getBG() {
		let width = window.innerWidth;
		let BG;
		switch (width > 500) {
			case true:
				BG = this.state.settings.options.backgroundLrg;
				break;

			default:
				BG = this.state.settings.options.backgroundImg;
				break;
		}
		return `background: url("${BG}")`;
	}

	// --------------------------- RENDERING --------------------------- //

	// SETS UP AND RETURNS PAGE COMPONENTS
	renderPages() {
		// PREVENT ACCIDENTAL RENDERS
		console.log(window.location.protocol);

		if (this.state.settings.pages.length === 0 && window.location.protocol != 'file:') {
			return (
				<div style={'height: 100vh'}>
					<h1>Click "Add a Page" to begin!</h1>
					<small>(This will never appear to users)</small>
				</div>
			);
		} else if (this.state.settings.pages.length === 0) {
			return <div />;
		}
		let pages = [];

		// REMOVES EXISTING PAGES AND NAVS (PREVENTS BUILDUP)
		if (document.querySelector('.js_slides')) document.querySelector('.js_slides').innerHTML = '';
		if (document.querySelector('.js_dots')) {
			let dots = document.querySelector('.js_dots');
			if (dots.childElementCount > this.state.settings.pages.length) {
				while (dots.childElementCount > 0) {
					dots.removeChild(dots.firstChild);
				}
			}
		}

		// INTERPERETS BG COLOR AND PUSHES PAGES TO STATE
		this.state.settings.pages.forEach(page => {
			// if (!page.backgroundColor.solid) return;
			// INTERPRET BG COLOR, PASS ONLY BG CSS
			page.backgroundColor.colorType === 'solid' ? (page.backgroundColor = page.backgroundColor.solid.backgroundCSS) : (page.backgroundColor = page.backgroundColor.gradient.backgroundCSS);
			// PASS PROPS TO PAGE AND PUSH
			page.headerFontSize = this.state.settings.options.headerFontSize;
			page.bodyFontSize = this.state.settings.options.bodyFontSize;
			pages.push(<Page index={this.state.settings.pages.indexOf(page)} header={this.state.settings.options.headerImg} layout={this.state.settings.options.layout} data={page} />);
		});

		// FORMAT THE PAGES AND NAV AFTER RETURN STATEMENT
		setTimeout(() => this.loryFormat(), 1);
		return pages;
	}

	render() {
		let style = '';
		this.state.settings.options.navShadow ? (this.state.settings.options.navPosition === 'top' ? (style += 'box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 4px 0px;') : (style += 'box-shadow: 0 -2px 4px 0 rgba(0,0,0,.15);')) : false;
		this.state.settings.options.navBorder ? (style += 'border-top: 1px solid rgba(0, 0, 0, 0.24);') : null;
		let dotNav = <ul className="dots js_dots sticky footerBackgroundColorTheme" id="dot-nav" style={style} />;
		// let header = <div style={`background: url("${this.state.settings.options.headerImgSrc}");`} className="header-image"/>;

		// let options = {
		// 	width: window.innerWidth * 1.114,
		// 	height: (window.innerHeight * 1.114) / 10
		// };
		let ratio = window.devicePixelRatio;
		let options = {
			width: document.body.clientWidth / ratio,
			height: document.body.clientHeight / ratio / 10
			// disablePixelRation: true
		};
		console.log(options, ratio);
		let headerStyle = '';
		let cropped;
		if (this.state.settings.options.headerImgSrc === false) {
			headerStyle += `background: url("./assets/noImg.PNG");`;
			headerStyle += 'background-position: center;';
		} else if (this.state.settings.options.headerImgSrc && options) {
			cropped = buildfire.imageLib.cropImage(this.state.settings.options.headerImgSrc, options);
			headerStyle += `background: url("${cropped}");`;
		}
		let header = (
			<div className="header-wrap">
				<div style={headerStyle} className="header-image" />
			</div>
		);
		return (
			<div className="backgroundColor" style={this.getBG()} id="container foo backgroundColor">
				<div id="cover" className="hide-cover">
					<div className="loader" />
				</div>
				<div id="sandbox" style={`${this.state.settings.options.backgroundCSS}`}>
					{this.state.settings.options.headerImg ? header : false}
					<div className="slider js_simple_dots simple" style={`text-align: ${this.state.settings.options.textAlign}`}>
						{this.state.settings.options.navPosition === 'top' && this.state.settings.pages.length > 0 ? dotNav : null}
						<div className="frame js_frame">
							<ul className="slides js_slides">{this.renderPages()}</ul>
						</div>
						{this.state.settings.pages ? this.state.settings.options.navPosition === 'bottom' && this.state.settings.pages.length > 0 ? dotNav : null : null}
					</div>
				</div>
			</div>
		);
	}
}

export default Widget;
