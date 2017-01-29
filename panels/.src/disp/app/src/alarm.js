import Dialog from '../lib/dialog.js';

export default function initAlerts( disp, onAccept, mapWidget )
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
	 * icon on the map and show a dialog.
	 */
	disp.on( "driver-alarm-on", function( event )
	{
		var driver = event.data.driver;
		/*
		 * Add a highlight to the driver's marker on the map.
		 */
		mapWidget.setClass( driver.id, "alarm" );

		showDialog( driver );
	});

	disp.on( "driver-alarm-off", function( event )
	{
		var driver = event.data.driver;
		/*
		 * Restore the driver's normal marker.
		 */
		mapWidget.removeClass( driver.id, "alarm" );
	});

	function showDialog( driver )
	{
		var d = new Dialog( "Водитель " + driver.call_id +
			" отправил сигнал тревоги" );
		d.addButton( "Принять", function()
		{
			onAccept();

			/*
			 * Center the map on the driver.
			 */
			mapWidget.setPosition( driver.coords() );
			mapWidget.setZoom( 13 );
			d.close();
		} );
		d.show();
	}
}
