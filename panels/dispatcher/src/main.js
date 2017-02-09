import './lib/autocomplete.js';
import './lib/mapdata.js';
import './lib/html5.js';
import DX from './dx.js';

import './core/disp.js';

var React = require('react');
var ReactDOM = require('react-dom');

import App from './components/app.js';

window.disp = new DispatcherClient();
disp.dx = new DX( '/dx/dispatcher' );

/*
 * DispatcherClient doesn't have `off` function, so we
 * can't remove added listeners. We solve it using an
 * intermediary events retransmitter.
 */
class EventRepeater {
	constructor(obj) {
		this.obj = obj;
		this.listeners = {};
	}

	on(event, func) {
		if(!(event in this.listeners)) {
			this.createRepeater(event);
		}
		this.listeners[event].push(func);
	}

	off(event, func) {
		var i = this.listeners[event].indexOf(func);
		this.listeners[event].splice(i, 1);
	}

	createRepeater(event) {
		this.listeners[event] = [];
		var t = this;

		var f = function() {
			var _this = this;
			var args = arguments;
			t.listeners[event].forEach(function(f) {
				f.apply(_this, args);
			});
		};
		this.obj.on(event, f);
	}
}

disp.events = new EventRepeater(disp);

$(document).ready(function() {
	disp.on("ready", function() {
		ReactDOM.render(
			<App client={disp} />,
			document.getElementById('app-container')
		);
	});
});
