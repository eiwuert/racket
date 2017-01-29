var React = require('react');
var ReactDOM = require('react-dom');

import AppDialog from './app-dialog.js';
import sounds from '../../lib/sounds.js';
import {formatTime, formatSeconds} from '../../lib/format.js';
import orderForms from '../order-form/forms.js';

export default class OrderReminderDialog extends React.Component {
	constructor(props) {
		super(props);
		this.sound = sounds.track( "/res/dispatcher/phone.ogg" );
	}
	accept() {
		var order = this.props.order;
		order.exp_arrival_time = null;
		orderForms.show( order );
		this.sound.stop();
	}
	
	decline() {
		var order = this.props.order;
		var now = time.utc();
		order.reminder_time = now + 60;
		this.sound.stop();
	}
	
	componentDidMount() {
		this.sound.play();
	}

	render() {
		var order = this.props.order;
		var info = formatOrderDescription(order, this.props.client);
		return (<AppDialog id={this.props.id}
				yes="Отправить заказ..."
				no="Напомнить через минуту"
				onAccept={this.accept.bind(this)}
				onDecline={this.decline.bind(this)} >
				
				{info.map((s, i) => <div key={i}>{s}</div>)}
				<OrderPostponementInfo order={order} />
			</AppDialog>);
	}
};

class OrderPostponementInfo extends React.Component {
	componentDidMount() {
		this.timer = setInterval(this.forceUpdate.bind(this), 1000);
	}
	
	componentWillUnmount() {
		clearInterval(this.timer);
	}

	render() {
		var order = this.props.order;
		var dt = order.exp_arrival_time - time.utc();
		var timeString = formatTime( time.local( order.exp_arrival_time ) )
		if(dt >= 0) {
			return <div>Подать машину в {timeString} (через {formatSeconds(dt)})</div>;
		}
		return <div>Машина должна была быть подана в {timeString} ({formatSeconds(-dt)} назад)</div>;
	}
};

function formatOrderDescription( order, disp )
{
	var parts = [];
	parts.push( order.formatAddress() );

	var loc = disp.getLocation( order.src_loc_id );
	if( loc ) {
		parts.push( '&laquo;' + loc.name + '&raquo;' );
	}

	if( order.exp_arrival_time ) {
		parts.push( orderPostponeDescription( order ) );
	}
	parts.push( order.formatOptions() );

	return parts;
}
