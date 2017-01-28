import '../lib/autocomplete.js';
import '../lib/jobs.js';
import '../lib/mapdata.js';
import '../lib/html5.js';

import initReminderScript from './bookings-reminder.js';
import initCalls from './calls.js';

import OrderButton from './components/order-button.js';
import OrdersList from './components/orders-list.js';
import SettingsButton from './components/settings-button.js';
import AppTabs from './components/tabs.js';
import Toolbar from './components/toolbar.js';

import DX from './dx.js';

var React = require('react');
var ReactDOM = require('react-dom');

window.disp = new DispatcherClient();
disp.dx = new DX( '/dx/dispatcher' );

$( document ).ready( function()
{
	disp.on( "ready", function() {
		ReactDOM.render(<App/>, document.getElementById('app-container'));
		initReminderScript( disp );
		initCalls( disp );
	});
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
});

class App extends React.Component {
	render() {
		return (
			<div className="dispatcher-app">
				<Toolbar disp={disp} />
				<SettingsButton />
				<OrderButton/>
				<OrdersList/>
				<AppTabs/>
			</div>
		);
	}
};
