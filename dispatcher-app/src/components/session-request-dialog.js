var React = require('react');
var ReactDOM = require('react-dom');

import sounds from '../lib/sounds.js';
import Dialog from './dialog.js';

export default class SessionRequestDialog extends React.Component {
	constructor(props) {
		super(props);
		this.sound = sounds.track( "/res/dispatcher/phone.ogg" );
	}

	accept() {
		var disp = this.props.client;
		var driver_id = this.props.driverId;
		var odometer = this.props.odometer;
		
		this.sound.stop();

		var p = disp.openSession( driver_id, odometer )
			.catch( function( error ) {
				/*
				 * If the error is that the session already exists,
				 * consume it and treat the request as successful.
				 */
				if( error == "open" ) {
					return null;
				}
				/*
				 * If not, pass the error along.
				 */
				alert(error);
				throw error;
			})
		this.props.onAccept(driver_id);
	}

	decline() {
		this.props.onDecline(this.props.driverId);
	}

	componentDidMount() {
		this.sound.play();
	}
	
	componentWillUnmount() {
		this.sound.stop();
	}

	render() {
		var disp = this.props.client;
		var driver_id = this.props.driverId;
		var d = disp.getDriver( driver_id );
		return (<Dialog yes="Разрешить" no="Игнорировать"
			onAccept={this.accept.bind(this)}
			onDecline={this.decline.bind(this)}>
			Водитель {d.call_id} желает открыть смену
		</Dialog>);
	}
};
