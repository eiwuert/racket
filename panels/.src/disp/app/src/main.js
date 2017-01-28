import '../lib/autocomplete.js';
import '../lib/jobs.js';
import '../lib/mapdata.js';
import '../lib/html5.js';
import DX from './dx.js';

var React = require('react');
var ReactDOM = require('react-dom');

import App from './components/app.js';

window.disp = new DispatcherClient();
disp.dx = new DX( '/dx/dispatcher' );

$(document).ready(function() {
	disp.on("ready", function() {
		ReactDOM.render(
			<App client={disp} />,
			document.getElementById('app-container')
		);
	});
});
