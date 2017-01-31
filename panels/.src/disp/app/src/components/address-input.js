var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

import SuggestInput from './suggest-input.js';

export default class AddressInput extends React.Component {

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