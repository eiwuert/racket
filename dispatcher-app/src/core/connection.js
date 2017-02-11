export default Connection;

function Connection(dx)
{
	this.RTT = function() { return dx.RTT(); };

	var messageFunctions = {};
	var PERIOD = 3000;

	var socket;

	/*
	 * Open the connection.
	 */
	this.open = function(addr)
	{
		/*
		 * Get the initial data packet that describes all current
		 * state of the service, and emit it as an init message.
		 */
		dx.get( 'init' ).then( function( data )
		{
			checkQueues();
			socket = new WebSocket(addr);
			socket.onmessage = receive;

			/*
			 * Send the init message to the application.
			 */
			var msg = {
				name: 'init',
				data: data
			};
			dispatchMessage( msg );
		});
	};

	/*
	 * Sends a message to the server.
	 */
	this.send = function(command, data = {} )
	{
		var pack = {command, data};
		socket.send(JSON.stringify(pack));
	};

	function receive(event) {
		var data = JSON.parse(event.data);
		var msg = {
			name: data.command,
			data: data.data
		};
		dispatchMessage(msg);
	}

	/*
	 * While synchronizing queue images using just update messages is
	 * appealing, there is at least one race condition which might cause
	 * the wrong client-size image right from the beginning. Rather than
	 * deal with that, better stick to brute force until the performance
	 * becomes an issue.
	 */
	function checkQueues()
	{
		dx.get( "queues-snapshot" ).then( function( data ) {
			dispatchMessage( {name: "-queues-snapshot", data: data} );
		})
		.catch( function( error ) {
			console.warn( error );
			dispatchMessage( {name: "error", data: {error: error}} );
		})
		.then( function() {
			setTimeout( checkQueues, PERIOD );
		});
	}

	function dispatchMessage( msg )
	{
		var n = msg.name;
		if( !(n in messageFunctions ) ) {
			console.warn( "Unknown message: " + msg.name );
			return;
		}
		messageFunctions[n].forEach( function( f ) {
			f( msg );
		});
	}

	/*
	 * Add a function to listen to given type of messages.
	 */
	this.onMessage = function( messageType, func )
	{
		if( messageType in messageFunctions ) {
			messageFunctions[messageType].push( func );
		} else {
			messageFunctions[messageType] = [ func ];
		}
	};

	this.dx = function() {
		return dx;
	};
}
