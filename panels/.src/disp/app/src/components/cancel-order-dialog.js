var React = require('react');
var ReactDOM = require('react-dom');

import AppDialog from './app-dialog.js';

export default class CancelOrderDialog extends React.Component {
	cancel() {
		var $content = $(ReactDOM.findDOMNode(this));
		var $reason = $content.find( 'textarea' );
		var $restore = $content.find( 'input[type="checkbox"]' );
		
		var reason = $reason.val();
		var restore = $restore.is( ':checked' );

		var order = this.props.order;
		var disp = this.props.client;
		var p = disp.cancelOrder( order.order_uid, reason );
		if( restore && order.taxi_id ) {
			p.then( function() {
				disp.restoreDriverQueue( order.taxi_id );
			});
		}
		return p;
	}

	render() {
		var order = this.props.order;
		return (
			<AppDialog id={this.props.id}
				title="Отмена заказа"
				yes="Отменить заказ" no="Закрыть окно"
				onAccept={this.cancel.bind(this)}>

				<p>Отменить заказ?</p>
				<textarea placeholder="Причина отмены"></textarea>
				{order.taxi_id && 
					<div>
					<label><input type="checkbox" /> Восстановить в очереди</label>
					</div>}
			</AppDialog>
		);
	}
};
