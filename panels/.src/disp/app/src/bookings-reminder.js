import orderForms from './order-form/forms.js';
import OrderReminderDialog from './components/order-reminder-dialog.js';
var React = require('react');
var ReactDOM = require('react-dom');

export default function initReminderScript( disp )
{
	setInterval( check, 5000 );
	/*
	 * Checks if there are postponed orders that have to be processed
	 * now.
	 */
	function check()
	{
		var now = time.utc();
		disp.orders().some( function( order )
		{
			if( !order.postponed() ) return false;

			if( now < order.reminder_time ) {
				return false;
			}
			return showReminder( order );
		});
	}

	function showReminder( order )
	{
		/*
		 * If we are editing this order now, don't pop up.
		 */
		if( orderForms.findOrderForm( order ) ) {
			return false;
		}
		window.__open(<OrderReminderDialog client={disp} order={order}/>, 'order-reminder-' + order.id);
		return true;
	}
}
