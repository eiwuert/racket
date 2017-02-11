var React = require('react'), ReactDOM = require('react-dom');
import Table from './table.js';

class Customer {
	constructor(data) {
		this.name = data.name;
		this.phone = data.phone;
	}
}

export default class CustomersTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			phoneFilter: '',
			nameFilter: '',
			result: []
		};
	}

	setPhone(event) {
		this.setState({phoneFilter: event.target.value});
		this.update();
	}
	
	setName(event) {
		this.setState({nameFilter: event.target.value});
		this.update();
	}
	
	update() {
		var query = {
			nameFilter: this.state.nameFilter,
			phoneFilter: this.state.phoneFilter
		};
		disp.dx.get('customers', query)
			.then(result => this.setState({result}));
	}

	render() {
		var cols = [
			{key: 'phone', title: "Телефон"},
			{key: 'name', title: "Имя"}
		];
		return (<div>
			<div className="form-inline">
				<div className="form-group">
					<label>Телефон</label>
					<input className="form-control"
						value={this.state.phoneFilter}
						onChange={this.setPhone.bind(this)}/>
				</div>
				<div className="form-group">
					<label>Имя</label>
					<input className="form-control"
						value={this.state.nameFilter}
						onChange={this.setName.bind(this)}/>
				</div>
			</div>
			<Table cols={cols} data={this.state.result}/>
		</div>);
	}
};
