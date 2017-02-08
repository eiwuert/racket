function ClientAPI(URL) {

	this.register = function(data) {
		return post('/register', data);
	};
	
	this.getStatus = function(data) {
		var url = http.url('/user-status', data);
		return get(url);
	};
	
	this.order = function(userId, data) {
		var url = http.url('/orders', {userId});
		return post(url, data);
	};

	this.cancel = function(userId, orderId) {
		var url = http.url('/cancel', {userId, orderId});
		return post(url, {});
	};

	this.getOrder = function(userId, orderId) {
		var url = http.url('/order', {userId, orderId});
		return get(url);
	};

	function get(path) {
		console.log("GET " + path);
		return http.get(URL + path).then(parseJSend);
	}

	function post(path, data) {
		console.log("POST " + path);
		return http.postJSON(URL + path, data).then(parseJSend);
	}

	function parseJSend(response) {
		if (response.contentType != 'application/json') {
			throw new Error('Non-JSON response from server: ' + response.body);
		}
		var data = JSON.parse(response.body);
		if (!data.status) {
			throw new Error('Missing `status` field in the response');
		}
		console.log(data.status, data.data);
		switch (data.status) {
			case 'error':
				throw new Error('Server error: ' + data.message);
			case 'fail':
				throw data.data;
			case 'success':
				return data.data;
			default:
				throw new Error('Unknown response status: ' + data.status);
		}
	}
}

var http = {};

/*
 * Creates a url with "query variables".
 * `vars` is a dict with query vars. `base` may have variables in it too.
 * Example: http.url( '/?v=json&b=mapdata', {p: bounds, lat: ...} )
 */
http.url = function(base, vars) {
	if (!vars) {
		return base;
	}

	var url = base;
	var haveQ = url.indexOf('?') != -1;

	for (var i in vars)
	{
		if (typeof vars[i] == "undefined")
			continue;

		if (!haveQ) {
			url += '?';
			haveQ = true;
		} else {
			url += '&';
		}

		url += i + "=" + encodeURIComponent(vars[i]);
	}
	return url;
};

/*
 * Sends a GET request to the given URL
 */
http.get = function(url)
{
	var req = new XMLHttpRequest();
	var p = promise(req);
	req.open('GET', url);
	req.send();
	return p;
};

/*
 * Sends a POST request using `data` as post values.
 * The data may be a plain object or a FormData instance.
 */
http.post = function(url, data)
{
	var req = new XMLHttpRequest();
	var p = promise(req);
	req.open('POST', url);
	var body;
	if (data instanceof FormData) {
		body = data;
	} else {
		req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		body = encodeForm(data);
	}
	req.send(body);
	return p;
};

http.postJSON = function(url, data)
{
	var req = new XMLHttpRequest();
	var p = promise(req);
	req.open('POST', url);
	//req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	req.send(JSON.stringify(data));
	return p;
};

function encodeForm(data)
{
	var lines = [];
	for (var k in data) {
		lines.push(k + "=" + encodeURIComponent(data[k]));
	}
	return lines.join("&");
}

/*
 * A response object that will be returned from promises
 */
function Response(req)
{
	this.status = req.status;
	this.statusText = req.statusText;
	this.contentType = req.getResponseHeader("Content-Type");
	this.body = req.responseText;
}

/*
 * Creates a Promise for given XMLHttpRequest object.
 */
function promise(req)
{
	var ph = {};

	var p = new Promise(function(ok, fail) {
		ph.ok = ok;
		ph.fail = fail;
	});

	var aborted = false;

	p.abort = function() {
		if (aborted)
			return;
		aborted = true;
		req.abort();
	};

	req.onreadystatechange = function() {
		/*
		 * If still working, continue.
		 */
		if (req.readyState != 4) { // 4 = DONE
			return;
		}

		if (aborted) {
			ph.fail("Aborted");
			return;
		}

		ph.ok(new Response(req));
	};
	return p;
}
