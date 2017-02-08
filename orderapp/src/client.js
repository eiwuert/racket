function Order(data)
{
	if (!data) {
		data = {};
	}

	this.street = data.street;
	this.house = data.house;
	this.id = data.id;
	this.status = data.status;
}

Order.prototype = {
	WAITING: 'waiting',
	ASSIGNED: 'assigned',
	ARRIVED: 'arrived',
	STARTED: 'started',
	FINISHED: 'finished',
	CANCELLED: 'cancelled',
	DROPPED: 'dropped',

	/*
	 * Returns true if the order can be cancelled.
	 */
	cancellable: function() {
		var cancellable = [
			'waiting',
			'assigned',
			'arrived',
			'started'
		];
		return cancellable.indexOf(this.status) != -1;
	},

	/*
	 * 
	 */
	current: function() {
		var resolved = [
			'finished',
			'dropped',
			'cancelled'
		];
		return resolved.indexOf(this.status) == -1;
	}
};

function Client(id)
{
	var order;
	var name;
	var phone;

	var API = new ClientAPI('http://taxi.loc/sym');

	/*
	 * Register on the server and obtain a user identifier.
	 * `data` object has to have `name` and `phone` fields.
	 */
	this.register = function(data) {
		return API.register(data).then(function(response) {
			id = response.userId;
			name = data.name;
			phone = data.phone;
			order = null;
			return {userId: id};
		});
	};

	/*
	 * Logs in to the server and fetches the user's registration
	 * data and the last order.
	 */
	this.login = function() {
		if (!id) {
			return Promise.resolve(false);
		}
		return API.getStatus({userId: id}).then(function(data) {
			if (!data) {
				return false;
			}
			name = data.name;
			phone = data.phone;
			if (data.lastOrder) {
				order = new Order(data.lastOrder);
			}
		});
	};

	this.getRegistration = function() {
		if (!name) {
			return null;
		}
		return {name, phone};
	};

	/*
	 * Send an order to the server.
	 * `data` has `street` and `house` fields.
	 */
	this.makeOrder = function(data) {
		// Only one order is allowed
		if (order && order.current()) {
			throw "Can't have more than one order";
		}

		return API.order(id, data).then(function(response) {
			console.log(response);
			order = new Order(response);
		});
	};

	/*
	 * Returns current order
	 */
	this.getOrder = function() {
		return order;
	};

	/*
	 * Cancels current order
	 */
	this.cancelOrder = function() {
		if (!order) {
			throw "No order";
		}
		return API.cancel(id, order.id)
			.then(function() {
				order = null;
			});
	};

	var listeners = {'order-change': new Set()};

	function trigger(eventType) {
		listeners[eventType].forEach(function(f) {
			f();
		});
	}

	this.on = function(eventType, func) {
		if (!(eventType in listeners)) {
			throw new Error('Unknown event type: ' + eventType);
		}
		listeners[eventType].add(func);
	};

	this.off = function(eventType, func) {
		if (!(eventType in listeners)) {
			throw new Error('Unknown event type: ' + eventType);
		}
		listeners[eventType].delete(func);
	};

	setInterval(function() {
		if (!id || !order || !order.current()) {
			return;
		}
		API.getOrder(id, order.id).then(function(orderData) {
			if (orderData.status != order.status) {
				Object.assign(order, orderData);
				trigger('order-change');
			}
		});
	}, 1000);
}

function FakeAPI() {

	var order = null;

	this.register = function() {
		return fakeReply({userId: 42});
	};

	this.getStatus = function(data) {
		return fakeReply({
			userId: data.userId,
			name: 'John Bupkes',
			phone: '123',
			lastOrder: null
		});
	};

	this.order = function(userId, data) {
		order = {
			id: 44,
			street: data.street,
			house: data.house,
			status: 'waiting'
		};

		setTimeout(function() {
			order.car = {
				name: 'VW Beetle',
				color: 'Blue',
				plate: 'T1402X'
			};
			order.driver = {
				name: 'Jack Torrance'
			};
			order.status = 'assigned';
		}, 3000);

		setTimeout(function() {
			order.status = 'arrived';
		}, 5000);

		setTimeout(function() {
			order.status = 'started';
		}, 8000);

		setTimeout(function() {
			order.status = 'finished';
		}, 16000);

		return fakeReply(order);
	};

	this.cancel = function(userId, orderId) {
		return fakeReply({});
	};

	this.getOrder = function(userId, orderId) {
		return fakeReply(order);
	};

	function fakeReply(val) {
		var c = copy(val);
		return new Promise(function(ok) {
			setTimeout(function() {
				console.log(c);
				ok(c);
			}, 1000);
		});
	}

	function copy(o) {
		return JSON.parse(JSON.stringify(o));
	}
}
