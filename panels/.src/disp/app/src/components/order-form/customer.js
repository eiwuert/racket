var React = require('react');
var ReactDOM = require('react-dom');

export default class CustomerSection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			addresses: [],
			wait: 0
		};
		this.nameChange = this.nameChange.bind(this);
		this.phoneChange = this.phoneChange.bind(this);
	}
	
	nameChange(name) {
		this.props.onNameChange(name);
	}
	
	phoneChange(phone) {
		this.props.onPhoneChange(phone);
		
		var t = this;
		
		t.setState(function(s) {
			s.wait++;
			s.addresses = [];
			return s;
		});
	
		disp.findCustomer( getPhone(phone) ).then( function( customer ) {
			t.props.onNameChange(customer.name);
			t.setState(function(s) {
				s.wait--;
				s.addresses = customer.addresses;
				return s;
			});
		})
		.catch( function() {
			// No such customer
			t.setState(function(s) {
				s.wait--;
				return s;
			});
		});
	}

	render() {
		return (<div>
			<CustomerInput name={this.props.name} phone={this.props.phone}
				onPhoneChange={this.phoneChange}
				onNameChange={this.nameChange}
				wait={this.state.wait > 0}/>
			<Addrlist list={this.state.addresses}
				onAccept={this.props.onAddress}
				/>
		</div>);
	}
};

class CustomerInput extends React.Component {
	phoneChange(e) {
		this.props.onPhoneChange(e.target.value);
	}
	nameChange(e) {
		this.props.onNameChange(e.target.value);
	}

	render() {
		return (<div>
			<div>
				<label>Телефон клиента</label>
				<input type="tel" value={this.props.phone} onChange={this.phoneChange.bind(this)} />
			</div>
			<div>
				<label>Имя клиента</label>
				<input
					className={this.props.wait? 'wait' : ''}
					value={this.props.name} onChange={this.nameChange.bind(this)} />
			</div>
		</div>);
	}
};

class Addrlist extends React.Component {
	render() {
		return (<div>
			{this.props.list.map((a, i) => <button key={i} type="button"
				onClick={this.props.onAccept.bind(undefined, a)}>{a.format()}</button>)}
		</div>);
	}
};

function getPhone(val)
{
	var n = val.replace( /[\s]/g, '' );
	/*
	 * If there is not enough digits even for bare number, return
	 * whatever is there.
	 */
	if( n.length < 7 ) return n;
	/*
	 * If it's a bare number, add default area code.
	 * Also add country code if it's not there.
	 */
	if( n.length == 7 ) {
		n = "29" + n;
	}
	if( n.length == 9 ) {
		n = "+375" + n;
	}
	return n;
}