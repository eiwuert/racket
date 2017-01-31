import initReminderScript from '../bookings-reminder.js';
import initCalls from '../calls.js';
import Dialog from '../../lib/dialog.js';

import OrderButton from './order-button.js';
import OrdersList from './orders-list.js';
import SettingsButton from './settings-button.js';
import Toolbar from './toolbar.js';

import DispatcherMap from './dispatcher-map.js';
import Monitor from './monitor.js';
import DriversTable from './drivers-table.js';
import OrdersTable from './orders-table.js';
import Calculator from './calculator.js';
import SessionsTable from './sessions-table.js';
import ServiceLog from './service-log.js';

import DialogHost from './dialog-host.js';

import SessionRequestDialog from './session-request-dialog.js';
import CancelOrderDialog from './cancel-order-dialog.js';

var React = require('react');
var ReactDOM = require('react-dom');
var {Tab, Tabs, TabList, TabPanel} = require('react-tabs');

export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.client = props.client;
		this.state = {
			tabIndex: 0
		};
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
		
		disp.on('driver-alarm-on', function(event) {
			var driver = event.data.driver;
			showAlarmDialog( driver );
		});
		
		disp.on( 'session-requested', function( event ) {
			var r = event.data;
			window.__open(<SessionRequestDialog
				client={disp}
				driverId={r.driver_id}
				odometer={r.odometer} />, 'session-request-' + r.driver_id);
		});
	}

	onSelect(i) {
		this.setState({tabIndex: i});
		// Some widgets on the panes adjust their sizes
		// when this event is emitted.
		setTimeout(function(){$(window).trigger('resize')}, 1);
	}

	showAlarmDialog( driver )
	{
		var t = this;
		var d = new Dialog( "Водитель " + driver.call_id +
			" отправил сигнал тревоги" );
		d.addButton( "Принять", function() {
			t.setState({tabIndex: 1});
			d.close();
		} );
		d.show();
	}
	
	onCancelClick(order) {
		window.__open(<CancelOrderDialog order={order} client={disp} />, 'cancel-order-'+order.id);
	}

	render() {
		return (
			<div className="dispatcher-app">
				<Toolbar client={this.client} />
				<SettingsButton client={this.client} />
				<OrderButton client={this.client}/>
				<OrdersList client={this.client} onCancelClick={this.onCancelClick}/>
				<Tabs onSelect={this.onSelect.bind(this)} selectedIndex={this.state.tabIndex}>
					<TabList>
						<Tab>Очереди</Tab>
						<Tab>Карта</Tab>
						<Tab>Водители</Tab>
						<Tab>Заказы</Tab>
						<Tab>Калькулятор</Tab>
						<Tab>Смены</Tab>
						<Tab>Журнал</Tab>
					</TabList>
					<TabPanel><Monitor client={this.props.client} /></TabPanel>
					<TabPanel>
						<DispatcherMap client={this.props.client} />
					</TabPanel>
					<TabPanel><DriversTable client={this.props.client} /></TabPanel>
					<TabPanel><OrdersTable client={this.props.client} /></TabPanel>
					<TabPanel><Calculator client={this.props.client} /></TabPanel>
					<TabPanel><SessionsTable client={this.props.client} /></TabPanel>
					<TabPanel><ServiceLog client={this.props.client} /></TabPanel>
				</Tabs>
				<DialogHost />
			</div>
		);
	}
};
