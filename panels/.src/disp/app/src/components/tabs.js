var React = require('react');
var ReactDOM = require('react-dom');

import hotkeys from '../../lib/hotkeys.js';
import TabsWidget from '../widgets/tabs.js';

import DispatcherMap from './dispatcher-map.js';
import Monitor from './monitor.js';
import DriversTable from './drivers-table.js';
import OrdersTable from './orders-table.js';
import Calculator from './calculator.js';
import SessionsTable from './sessions-table.js';
import ServiceLog from './service-log.js';


export default class AppTabs extends React.Component {
	componentDidMount() {
		var container = ReactDOM.findDOMNode(this).firstChild;
		
		var tabs = new TabsWidget(disp);
		container.appendChild(tabs.root());
		hotkeys.bind( 'alt+m', tabs.next );
		
		
		ReactDOM.render(
			<Monitor client={this.props.client} />,
			tabs.addTab('Очереди').root()
		);
	
		tabs.PAGE_MAP = tabs.count();
		ReactDOM.render(
			<DispatcherMap client={this.props.client} tabsWidget={tabs} />,
			tabs.addTab('Карта').root()
		);
	
		ReactDOM.render(
			<DriversTable client={this.props.client} />,
			tabs.addTab('Водители').root()
		);
	
		ReactDOM.render(
			<OrdersTable client={this.props.client} />,
			tabs.addTab('Заказы').root()
		);
	
		ReactDOM.render(
			<Calculator client={this.props.client} />,
			tabs.addTab('Калькулятор').root()
		);
	
		if( this.props.client.sessionsEnabled() ) {
			ReactDOM.render(
				<SessionsTable client={this.props.client} />,
				tabs.addTab('Смены').root()
			);
		}

		ReactDOM.render(
			<ServiceLog client={this.props.client} />,
			tabs.addTab('Журнал').root()
		);
	}

	render() {
		return <div className="tabs-container"><div></div></div>;
	}
};