import React, {Component} from 'react';
import debounce from 'lodash.debounce';

class Settings extends Component {
  constructor(props) {
		super(props);
		this.debounceSync = debounce(this.syncState, 100);
		this.state = {
			settings: {
				options: {
					backgroundImg: '',
					backgroundLrg: '',
					backgroundCSS: '',
					backgroundColor: {},
					textAlign: 'left',
					renderTitlebar: true,
					navPosition: null,
					colorOverrides: [],
					layout: 0
				}
			}
		};
	}
}

export default Settings;
