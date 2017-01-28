import initReminderScript from '../bookings-reminder.js';
import initCalls from '../calls.js';

import OrderButton from './order-button.js';
import OrdersList from './orders-list.js';
import SettingsButton from './settings-button.js';
import AppTabs from './tabs.js';
import Toolbar from './toolbar.js';

var React = require('react');
var ReactDOM = require('react-dom');

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.client = props.client;
	}

	componentDidMount() {
		initReminderScript(this.client);
		initCalls(this.client);
		
		var disp = this.client;
		disp.on( "connection-error", function( event ) {
			if( event.data.error == "Unauthorised" ) {
				alert( "Ваша сессия была закрыта сервером, перезагрузите страницу." );
				return;
			}
			alert( "Ошибка соединения: " + event.data.error );
		});
		disp.on( "sync", function( event ) {
			alert( "Ваша сессия была закрыта сервером, перезагрузите страницу." );
			return;
		});
	}

	render() {
		return (
			<div className="dispatcher-app">
				<Toolbar client={this.client} />
				<SettingsButton client={this.client} />
				<OrderButton client={this.client}/>
				<OrdersList client={this.client}/>
				<AppTabs client={this.client}/>
			</div>
		);
	}
};
