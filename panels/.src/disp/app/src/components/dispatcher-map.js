var React = require('react');
var ReactDOM = require('react-dom');

import MapWidget from '../widgets/map.js';

export default class DispatcherMap extends React.Component {
	componentDidMount() {
		var map = new MapWidget(this.props.client);
		ReactDOM.findDOMNode(this).firstChild.appendChild(map.root());
		initAlerts(this.props.client, map);
	}
	render() {
		return <div className="main-map"><div></div></div>;
	}
};

function initAlerts( disp, mapWidget )
{
	/*
	 * Display alarms that are currently on.
	 */
	disp.driverAlarms().forEach( function( alarm ) {
		/*
		 * Add a highlight to the driver's marker on the map.
		 */
		mapWidget.setClass( alarm.driverId, "alarm" );
	});

	/*
	 * When a driver sends an alarm command, highlight their
	 * icon on the map.
	 */
	disp.on( "driver-alarm-on", function( event )
	{
		/*
		 * Add a highlight to the driver's marker on the map.
		 */
		var driver = event.data.driver;
		mapWidget.setClass( driver.id, "alarm" );
		/*
		 * Center the map on the driver.
		 */
		mapWidget.setPosition( driver.coords() );
		mapWidget.setZoom( 13 );
	});

	disp.on( "driver-alarm-off", function( event )
	{
		/*
		 * Restore the driver's normal marker.
		 */
		var driver = event.data.driver;
		mapWidget.removeClass( driver.id, "alarm" );
	});
}