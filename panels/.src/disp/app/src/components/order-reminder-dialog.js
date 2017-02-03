var React = require('react');
var ReactDOM = require('react-dom');

import Dialog from './dialog.js';
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
		this.props.onAccept();
	}

	decline() {
		var order = this.props.order;
		window.a = order;
		var now = time.utc();
		order.reminder_time = now + 60;
		this.sound.stop();
		this.props.onDecline();
	}

	componentDidMount() {
		this.sound.play();
	}

	render() {
		var order = this.props.order;
		var loc = disp.getLocation( order.src_loc_id );
		return (<Dialog
				yes="Отправить заказ..."
				no="Напомнить через минуту"
				onAccept={this.accept.bind(this)}
				onDecline={this.decline.bind(this)} >
				<p>{order.formatAddress()}</p>
				{loc && <p>{loc.name}</p>}
				<p>{order.formatOptions()}</p>
				<OrderPostponementInfo order={order} />
			</Dialog>);
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
