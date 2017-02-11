import './lib/autocomplete.js';
import './lib/mapdata.js';
import './lib/html5.js';

import './core/disp.js';

var React = require('react');
var ReactDOM = require('react-dom');

import App from './components/app.js';

window.disp = new DispatcherClient();

$(document).ready(function() {
	disp.on("ready", function() {
		ReactDOM.render(
			<App client={disp} />,
			document.getElementById('app-container')
		);
	});
});
