
var client = null;

function getClient() {
	if (client) {
		return Promise.resolve(client);
	}

	var id = localStorage.getItem('userId');
	client = new Client(id);
	return client.login().then(function() {
		return client;
	}).catch(function() {
		return client;
	});
}

var app = angular.module('Reebok', ['ngRoute', 'ngMaterial']);

app.config(function($routeProvider) {
	var pages = ['login', 'form', 'order'];

	pages.forEach(function(name) {
		var cname = name.charAt(0).toUpperCase() + name.substr(1)
			+ 'Controller';
		$routeProvider.when('/' + name, {
			templateUrl: 'src/' + name + '.html',
			controller: cname,
			resolve: {
				client: getClient
			}
		});
	});

	$routeProvider.when('/', {
		controller: 'InitController',
		templateUrl: 'init.html',
		resolve: {
			client: getClient
		}
	});

	$routeProvider.otherwise({
		templateUrl: 'error.html'
	});
});

/*
 * Loading screen, deside where to redirect the user
 */
app.controller('InitController', function($location, client) {
	if (!client.getRegistration()) {
		$location.path('login');
	} else if (client.getOrder()) {
		$location.path('order');
	} else {
		$location.path('form');
	}
	$location.replace();
});

/*
 * Registration form
 */
app.controller('LoginController', function($scope, $location, client) {
	var reg = client.getRegistration() || {};
	Object.assign($scope, {
		name: reg.name,
		phone: reg.phone,
		wait: false,

		valid() {
			return this.name && this.phone;
		},

		login() {
			var t = this;
			t.wait = true;
			var data = {name: this.name, phone: this.phone};
			client.register(data)
				.then(function(data) {
					console.log(data);
					localStorage.setItem('userId', data.userId);
					t.wait = false;
					$location.path('form').replace();
					$scope.$apply();
				});
		}
	});
});

/*
 * Order form
 */
app.controller('FormController', function($scope, $location, client) {
	if(!client.getRegistration()) {
		$location.path('login');
		return;
	}

	Object.assign($scope, {
		street: '',
		house: '',
		wait: false,

		valid() {
			return this.street && this.house;
		},

		order() {
			this.wait = true;
			var t = this;
			var data = {
				street: this.street,
				house: this.house
			};
			client.makeOrder(data)
				.then(function() {
					t.wait = false;
					$location.path('/order');
				})
				.catch(function(error) {
					t.wait = false;
					alert(error);
				})
				.then(function() {
					$scope.$apply();
				});
		}
	});
});

/*
 * Order info page
 */
app.controller('OrderController', function($scope, $window, client) {
	Object.assign($scope, {
		order: client.getOrder(),
		cancelling: false,

		canCancel() {
			return this.order && this.order.cancellable();
		},

		cancel() {
			var t = this;
			t.cancelling = true;
			client.cancelOrder().then(function() {
				t.cancelling = false;
				t.goBack();
			});
		},

		goBack() {
			// "Back" is supposed to lead to order form page.
			$window.history.back();
		}
	});

	function sync() {
		$scope.$apply();
	}

	client.on('order-change', sync);
	$scope.$on('$destroy', function() {
		client.off('order-change', sync);
	});
});
