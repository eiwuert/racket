import obj from '../../lib/obj.js';

var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

class Group extends React.Component {
	render() {
		return (<div>
			<Object
				value={this.props.locName}
				onChange={this.props.onLocChange}/>
			<QueueSelector
				value={this.props.qid}
				onChange={this.props.onQueueChange}/>
			<AddressInput
				address={this.props.addr}
				onChange={this.props.onAddrChange}/>
		</div>);
	}
};

export default function AddressGroupSection( $container )
{
	var c = document.createElement('div');
	$container.append(c);
	var $c = $(c);
	
	var addr = {
		place: disp.param('default_city'),
		street: '',
		house: '',
		building: '',
		entrance: '',
		apartment: ''
	};
	var qid = '0';
	var locName = '';
	var location = null;

	function r() {
		ReactDOM.render(<Group
			qid={qid} onQueueChange={onQueueChange}
			addr={addr} onAddrChange={onAddrChange}
			locName={locName} onLocChange={onLocChange}/>, c);
	}
	r();
	
	function onAddrChange( newAddr ) {
		addr = newAddr;
		qid = null;
		location = null;
		locName = '';
		r();
	}
	
	function onQueueChange(newQid) {
		qid = newQid;
		location = null;
		locName = '';
		var loc = disp.getQueueLocation(qid);
		setAddr(loc ? loc.addr : null);
		r();
	}
	
	function onLocChange(val, item) {
		locName = val;
		location = item;
		setAddr( location ? location.addr : null );
		qid = null;
		r();
	}
	
	function setAddr(newAddr) {
		if(newAddr == null ) {
			newAddr = {
				place: "",
				street: "",
				house: "",
				building: "",
				entrance: "",
				apartment: ""
			};
		}
		addr = newAddr;
	}
	
	this.get = function()
	{
		var loc = disp.getQueueLocation(qid) || location;
		var locId = loc ? loc.loc_id : null;
		return {
			addr: addr,
			loc_id: locId
		};
	};

	this.set = function( spec )
	{
		setAddr( spec.addr );
		qid = locQueue(spec.loc_id);
		r();
	};

	function locQueue( loc_id ) {
		if( !loc_id ) return null;
		var q = disp.queues();
		for( var i = 0; i < q.length; i++ ) {
			if( q[i].loc_id == loc_id ) {
				return q[i].id;
			}
		}
		return null;
	}

	this.setQueue = function( newQid )
	{
		qid = newQid;
		var loc = disp.getQueueLocation(qid);
		if( loc ) {
			location = loc;
			locName = loc ? loc.name : '';
			setAddr( loc.addr );
		}
		r();
	};

	this.slideToggle = function() {
		$c.slideToggle( 'fast' );
	};

	this.hide = function() {
		$c.hide();
	};
}

class AddressInput extends React.Component {

	constructor(props) {
		super(props);
		this.onChange = this.onChange.bind(this);
		this.onPlaceChange = this.onPlaceChange.bind(this);
		this.onStreetChange = this.onStreetChange.bind(this);
		this.suggestStreets = this.suggestStreets.bind(this);
	}

	suggestStreets(term, callback) {
		var city = this.props.address.place;
		mapdata.getStreetSuggestions(term, city, callback);
	}

	onChange(event) {
		var a = _.clone(this.props.address);
		var k = event.target.className;
		if(!(k in a)) {
			throw new Error(`Invalid address key: ${k}`);
		}
		a[k] = event.target.value;
		this.props.onChange(a);
	}
	
	onStreetChange(value) {
		var a = _.clone(this.props.address);
		a.street = value;
		this.props.onChange(a);
	}

	onPlaceChange(value) {
		var a = _.clone(this.props.address);
		a.place = value;
		this.props.onChange(a);
	}

	render() {
		var a = this.props.address;
		return (<div>
			<div>
				<label>Город</label>
				<SuggestInput
					className="place"
					func={mapdata.getPlaceSuggestions}
					value={a.place}
					onChange={this.onPlaceChange}/>
			</div>
			<div>
				<label>Улица</label>
				<SuggestInput
					className="street"
					func={this.suggestStreets}
					value={a.street}
					onChange={this.onStreetChange}/>
			</div>
			<div>
				<label>Дом, корпус</label>
				<input className="house" size="2" value={a.house} onChange={this.onChange}/>,
				<input className="building" size="2" value={a.building} onChange={this.onChange}/>
			</div>
			<div>
				<label>Подъезд, квартира</label>
				<input className="entrance" value={a.entrance} onChange={this.onChange}/>,
				<input className="apartment" value={a.apartment} onChange={this.onChange}/>
			</div>
		</div>);
	};
};

class QueueSelector extends React.Component {
	onChange(event) {
		this.props.onChange(event.target.value);
	}

	render() {
		var list = disp.queues().filter(q => q.loc_id);
		return (<div>
			<label>Объект (к)</label>
			<select className="queue-loc"
				value={this.props.value || '0'}
				onChange={this.onChange.bind(this)}>
				<option value=""></option>
				{ list.map(q => <option key={q.id} value={q.id}>{q.name}</option>) }
			</select>
		</div>);
	}
};

class SuggestInput extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		var $input = $(ReactDOM.findDOMNode(this));
		var t = this;
		$input.autocomplete(this.props.func, function(value, item) {
			t.props.onChange(value, item);
		});
	}

	handleChange(e) {
		this.props.onChange(e.target.value, null);
	}

	render() {
		return <input className={this.props.className} value={this.props.value} onChange={this.handleChange} />;
	}
};

class Object extends React.Component {
	lookup(term, callback) {
		disp.suggestLocations(term).then(function(locations) {
			var strings = obj.column(locations, 'name');
			callback(strings, locations);
		});
	}
	render() {
		return (<div>
			<label>Объект</label>
			<SuggestInput
				value={this.props.value}
				func={this.lookup}
				onChange={this.props.onChange}/>
		</div>);
	}
};
