var React = require('react');
var ReactDOM = require('react-dom');

const MAX_LENGTH = 30;

export default class ServiceLog extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: []
		};
		this.id = 1;
	}

	componentWillMount() {
		var disp = this.props.client;
		var t = this;

		disp.dx.get( 'service-log', {n: MAX_LENGTH} )
		.then( function( messages ) {
			t.setState({messages: messages.reverse()});
		
			var id;
			if(t.state.messages.length > 0) {
				id = parseInt(t.state.messages[0].message_id, 10);
			}
			else {
				id = 1;
			}

			disp.on( 'service-log', function( event )
			{
				t.setState(function(prevState, props) {
					
					var msg = {
						text: event.data.text,
						message_id: ++id
					};

					var messages = prevState.messages;
					messages.unshift(msg);
					if(messages.length > MAX_LENGTH) {
						messages.pop();
					}
					return {messages};
				});
			});
		
		});

		
	}

	render() {
		return (
			<div id="events-log">
			{this.state.messages.map(m => <p key={m.message_id}>{m.text}</p>)}
			</div>
		);
	}
};
