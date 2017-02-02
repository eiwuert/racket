import Dialog from './dialog.js';
var React = require('react'), ReactDOM = require('react-dom');

/*
 * Dialog for opening a new driver's session
 */
export default class OpenSessionDialog extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			noDriver: true
		};
	}

	accept() {
		var $s = $(ReactDOM.findDOMNode(this));
		var $id = $s.find( 'select' );
		var $km = $s.find( 'input' );

		var driverId = $id.val();
		var odometer = $km.val();
		if( driverId == '0' ) {
			return;
		}
		this.props.onAccept({driverId, odometer});
	}

	onDriverChange(e) {
		this.setState({
			noDriver: e.target.value == '0'
		});
	}

	render() {
		var cn = 'form-group';
		if(this.state.noDriver) {
			cn += ' has-error';
		}
		return (
			<Dialog yes="Открыть" onAccept={this.accept.bind(this)}
				no="Отменить" onDecline={this.props.onDecline}>
				<div className={cn}>
					<label>Водитель</label>
					<UnadmittedDriversList
						client={this.props.client}
						onChange={this.onDriverChange.bind(this)}
						/>
				</div>
				<div className="form-group">
					<label>Одометр</label>
					<div className="input-group">
						<input type="number" min="0" step="1" className="form-control" />
						<div className="input-group-addon"> км</div>
					</div>
				</div>
			</Dialog>);
	}
};

// List of drivers who need their session opened
class UnadmittedDriversList extends React.Component {
	render() {
		//var disp = this.props.client;
		var list = disp.drivers().filter(d => disp.sessionRequired(d.id));
		return (
			<select className="form-control" onChange={this.props.onChange}>
				<option value="0"></option>
				{list.map(d => <option key={d.id} value={d.id}>{d.call_id} - {d.surname()}</option>)}
			</select>
		);
	}
};
