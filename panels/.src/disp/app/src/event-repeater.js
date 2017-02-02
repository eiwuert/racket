
export default class EventRepeater {
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
