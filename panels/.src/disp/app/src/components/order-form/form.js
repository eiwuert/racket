import Group from './address-group.js';
import CustomerSection from './customer.js';
import Options from './options.js';
import Postpone from './postpone.js';
import DriverSelector from './driver-selector.js';

var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

var time = window.time;
var Order = window.Order;

export default class Form extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dest: false
		};
	}
	
	toggleDest() {
		this.setState(function(s) {
			s.dest = !s.dest;
			return s;
		});
	}

	change(diff) {
		var o = _.extend(_.clone(this.props.order), diff);
		this.props.onChange(o);
	}

	driverChange(id) {
		this.change({driverId: id});
	}
	
	optionsChange(opt) {
		this.change({opt});
	}
	
	sourceChange(loc) {
		this.change({sourceLocation: loc});
	}
	
	destChange(loc) {
		this.change({destLocation: loc});
	}

	customerPhoneChange(phone) {
		var customer = _.clone(this.props.order.customer);
		customer.phone = phone;
		this.change({customer});
	}
	
	customerNameChange(name) {
		var customer = _.clone(this.props.order.customer);
		customer.name = name;
		this.change({customer});
	}
	
	acceptCustomerAddress(addr) {
		this.props.onCustomerAddress(addr);
	}
	
	onPostponeToggle(enable) {
		var postpone = _.clone(this.props.order.postpone);
		postpone.disabled = !enable;
		if(enable) {
			postpone.time = time.utc();
			postpone.remind = 0;	
		}
		this.change({postpone});
	}
	
	onPostponeTimeChange(t) {
		var postpone = _.clone(this.props.order.postpone);
		postpone.time = t;
		this.change({postpone});
	}
	
	onPostponeRemindChange(remind) {
		var postpone = _.clone(this.props.order.postpone);
		postpone.remind = remind;
		this.change({postpone});
	}
	
	commentsChange(event) {
		this.change({comments: event.target.value});
	}

	render() {
		var o = this.props.order;
		return (<form className="order-form">
			<div className="title">{this.props.title}</div>
			<DriverSelector
				onChange={this.driverChange.bind(this)}
				value={o.driverId}/>
			<Options
				options={o.opt}
				onChange={this.optionsChange.bind(this)}
				disabled={o.driverId != '0'}/>
			<CustomerSection
				name={o.customer.name} phone={o.customer.phone}
				onPhoneChange={this.customerPhoneChange.bind(this)}
				onNameChange={this.customerNameChange.bind(this)}
				onAddress={this.acceptCustomerAddress.bind(this)}
			/>
			<b>Место подачи</b>
			<Group loc={o.sourceLocation} onChange={this.sourceChange.bind(this)}/>
			<b
				className={this.state.dest? '' : 'more'}
				onClick={this.toggleDest.bind(this)}>Место назначения</b>
			<div className={this.state.dest? '' : 'hidden'}>
				<Group loc={o.destLocation} onChange={this.destChange.bind(this)}/>
			</div>
			
			<Postpone
				enabled={!o.postpone.disabled}
				time={o.postpone.time}
				remind={o.postpone.remind}
				onTimeChange={this.onPostponeTimeChange.bind(this)}
				onRemindChange={this.onPostponeRemindChange.bind(this)}
				onToggle={this.onPostponeToggle.bind(this)}
			/>
			<div>
				<label>Комментарии</label>
				<textarea value={o.comments} onChange={this.commentsChange.bind(this)}/>
			</div>
			<div className="status">{this.props.status}</div>
			<button type="button"
				disabled={this.props.status != ''}
				onClick={this.props.onAccept}>Отправить</button>
			<button type="button"
				className="cancel"
				onClick={this.props.onCancel}>Закрыть</button>
			
		</form>);
	}
};