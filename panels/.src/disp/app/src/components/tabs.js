import hotkeys from '../../lib/hotkeys.js';

var React = require('react');
var ReactDOM = require('react-dom');

import TabsWidget from '../widgets/tabs.js';
import initMonitorWidget from '../widgets/monitor/monitor.js';
import initChat from '../chat/chat.js';
import MapWidget from '../widgets/map.js';
import initAlerts from '../alarm.js';
import DriversTableWidget from '../widgets/drivers-table.js';
import OrdersTableWidget from '../widgets/orders-table.js';
import CalculatorWidget from '../widgets/calculator/calculator.js';
import ServiceLogWidget from '../widgets/service-log.js';

import initSessions from '../sessions.js';

export default class AppTabs extends React.Component {
	componentDidMount() {
		var container = ReactDOM.findDOMNode(this).firstChild;
		
		var tabs = new TabsWidget(disp);
		container.appendChild(tabs.root());
		hotkeys.bind( 'alt+m', tabs.next );

		var monitor = initMonitorWidget( disp, tabs );
		initChat( disp, monitor.qw );

		var map = new MapWidget( disp );
		tabs.addTab( 'Карта', map.root() );
		tabs.PAGE_MAP = tabs.count() - 1;

		initAlerts( disp, tabs, map );

		var dw = new DriversTableWidget( disp );
		tabs.addTab( 'Водители', dw.root() );

		var orders = new OrdersTableWidget( disp );
		tabs.addTab( 'Заказы', orders.root() );

		var calc = new CalculatorWidget( disp );
		tabs.addTab( "Калькулятор", calc.root() );

		if( disp.sessionsEnabled() ) {
			initSessions( disp, tabs );
		}

		var log = new ServiceLogWidget( disp );
		tabs.addTab( 'Журнал', log.root() );
	}

	render() {
		return <div className="tabs-container"><div></div></div>;
	}
};