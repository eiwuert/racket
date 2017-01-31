var React = require('react');
var ReactDOM = require('react-dom');

import obj from '../../../lib/obj.js';
import AddressInput from '../address-input.js';
import SuggestInput from '../suggest-input.js';

export default class Group extends React.Component {
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