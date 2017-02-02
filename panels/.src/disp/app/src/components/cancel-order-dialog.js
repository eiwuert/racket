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
				title={"Отмена заказа № " + order.order_id}
				yes="Отменить заказ" no="Закрыть окно"
				yesClass="btn-danger"
				onAccept={this.cancel.bind(this)}>

				<div className="form-group">
					<label>Причина отмены</label>
					<textarea className="form-control" rows="2"></textarea>
				</div>
				{order.taxi_id &&
				<div className="form-group">
					<label><input type="checkbox" className="form-control" /> Восстановить в очереди</label>
				</div>}
			</AppDialog>
		);
	}
};
