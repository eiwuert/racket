var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

import AddressInput from '../address-input.js';
import SuggestInput from '../suggest-input.js';

export default class Group extends React.Component {
	
	addrChange(addr) {
		this.props.onChange({addr: addr, id: null, name: ''});
	}

	locChange(loc) {
		loc.addr = loc.addr || emptyAddr();
		this.props.onChange(loc);
	}

	render() {
		return (<div>
			<LocSelector
				loc={this.props.loc}
				onChange={this.locChange.bind(this)}/>
			<AddressInput
				address={this.props.loc.addr}
				onChange={this.addrChange.bind(this)}/>
		</div>);
	}
};

class LocSelector extends React.Component {
	queueChange(qid) {
		var loc = disp.getQueueLocation(qid);
		this.props.onChange(loc);
	}

	onLocChange(loc) {
		this.props.onChange(loc);
	}

	render() {
		var loc = this.props.loc;
		var qid = locQueue(loc);
		return (<div>
			<ObjectInput
				loc={loc}
				onChange={this.onLocChange.bind(this)}/>
			<QueueSelector
				value={qid}
				onChange={this.queueChange.bind(this)}/>
		</div>);
	}
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

class ObjectInput extends React.Component {
	lookup(term, callback) {
		disp.suggestLocations(term).then(function(locations) {
			var strings = _.pluck(locations, 'name');
			callback(strings, locations);
		});
	}

	onChange(name, loc) {
		if(!loc) loc = {id: null, addr: null};
		loc.name = name;
		this.props.onChange(loc);
	}

	render() {
		return (<div>
			<label>Объект</label>
			<SuggestInput
				value={this.props.loc.name}
				func={this.lookup}
				onChange={this.onChange.bind(this)}/>
		</div>);
	}
};



function locQueue(loc) {
	if(!loc) return null;
	var loc_id = loc.id;
	var q = disp.queues();
	for( var i = 0; i < q.length; i++ ) {
		if( q[i].loc_id == loc_id ) {
			return q[i].id;
		}
	}
	return null;
}