# Client's order HTTP interface

The interface allows to:

* register on the server;
* get user's current status;
* order a cab;
* get an order's current status;
* cancel an order.

The methods used are "GET" and "POST".

For POST requests the client sends data in JSON format, always as an object.
The server's response format for all requests is
[JSend](https://labs.omniti.com/labs/jsend).


## Register on the server

	POST /register

Register on the server and obtain a user identifier.

Request data:

	* `name` - customer's name;
	* `phone` - customer's phone number.

Response object:

	* `userId` (string) - user's identifier.

The returned user identifier may be saved for future use, or a new identifier
may be requested each time. The entire point of the registration is to let the
server know the customer's name and phone number.


## Get user's current status

	GET /user-status?userId=<userId>

Obtain the user's name, phone, and the last processed order.

Response object:

	* `name` - customer's name;
	* `phone` - customer's phone number;
	* `lastOrder` (object) - customer's last order.


## Order a cab

	POST /orders?userId=<userId>

Request object:

	* `street`
	* `house`

Response object is an order object.


## Get an order's current status

	GET /order?userId=<userId>&orderId=<orderId>

Response object: an order object.


## Cancel an order

	POST /cancel?userId=<userId>&orderId=<orderId>

Response: empty.


## The order object

	`id`: <orderId>
	`status`: <order status>
	`location`: <location object>
	`cab`: <cab object>

### Location object

	type: 'address'
	data: {
		street: ''
		house: ''
	}

	type: 'coordinates'
	data: {
		latitude:
		longitude:
	}

### Cab object

cab object:

	driver: {
		name: ''
	}
	car: {
		name: ''
		color: ''
		plate: ''
	}
