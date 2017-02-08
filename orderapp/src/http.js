export default http;

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
