var React = require('react');
var ReactDOM = require('react-dom');

import OrdersWidget from '../widgets/orders-list/orders-widget.js';
import orderForms from '../order-form/forms.js';
import Dialog from '../../lib/dialog.js';

export default class OrdersList extends React.Component {
	componentDidMount() {
		var c = ReactDOM.findDOMNode(this);
		var w = new OrdersWidget(disp);
		c.appendChild(w.root());
		
		w.on( "order-click", function( event ) {
			orderForms.show( event.data.order );
		});
		w.on( "cancel-click", function( event ) {
			showCancelDialog( event.data.order );
		});
	}
	render() {
		return <div><div></div></div>;
	}
};

/*
 * Dialog for order cancelling.
 */
function showCancelDialog( order )
{
	var html = '<p>Отменить заказ?</p>'
		+ '<textarea placeholder="Причина отмены"></textarea>';
	if( order.taxi_id ) {
		html += '<div><label><input type="checkbox"> Восстановить в очереди</label></div>';
	}
	var $content = $( '<div>' + html + '</div>' );
	var $reason = $content.find( 'textarea' );
	var $restore = $content.find( 'input[type="checkbox"]' );

	var d = new Dialog( $content.get(0) );
	d.addButton( 'Отменить заказ', cancel, 'yes' );
	d.addButton( 'Закрыть окно', null, 'no' );
	d.show();

	function cancel()
	{
		var reason = $reason.val();
		var restore = $restore.is( ':checked' );

		var p = disp.cancelOrder( order.order_uid, reason );
		if( restore && order.taxi_id ) {
			p.then( function() {
				disp.restoreDriverQueue( order.taxi_id );
			});
		}
		this.close();
	}
}
