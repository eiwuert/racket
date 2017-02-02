import {formatDateTime} from '../../lib/format.js';
import AppDialog from './app-dialog.js';
import EventRepeater from '../event-repeater.js';

var React = require('react');
var ReactDOM = require('react-dom');

export default class SessionsTable extends React.Component {
	constructor(props) {
		super(props);
		var disp = props.client;
		this.state = {
			sessions: disp.sessions()
		};
		this.events = new EventRepeater(disp);
		this.refresh = this.refresh.bind(this);
	}
	
	refresh() {
		this.setState({sessions: this.props.client.sessions()});
	}

	componentDidMount() {
		this.events.on('sessions-changed', this.refresh);
	}

	componentWillUnmount() {
		this.events.off('sessions-changed', this.refresh);
	}

	render() {
		return (<div className="sessions-table">
			<button type="button" className="btn btn-default" onClick={this.props.onNewClick}>Открыть смену</button>
			<table className="table table-bordered table-condensed">
				<thead><tr><th>Начало</th>
					<th>Водитель</th>
					<th>Машина</th>
					<th></th></tr>
				</thead>
				<tbody>
					{ disp.sessions().map(s => <Row key={s.session_id} session={s} client={this.props.client}/>) }
				</tbody>
			</table>
		</div>);
	}
};

class Row extends React.Component {
	click(event) {
		var driver_id = this.props.session.driver_id;
		var button = event.target;
		var disp = this.props.client;

		var d = disp.getDriver( driver_id );
		/*
		 * If the driver is an imitation, close the session without
		 * asking.
		 */
		if( d.is_fake == '1' ) {
			button.disabled = true;
			disp.closeSession( driver_id, 0 );
			return;
		}
		/*
		 * If the driver is real, ask for the odometer value before
		 * closing.
		 */
		var driver = disp.getDriver( driver_id );
		if( !driver ) {
			console.error( "Unknown driver id: ", driver_id );
			return;
		}
		window.__open(<CloseSessionDialog client={disp} driver={d} />, 'close-session-' + driver_id);
	}

	render() {
		var s = this.props.session;
		var disp = this.props.client;
		var driver = disp.getDriver( s.driver_id );
		var car = disp.getDriverCar( s.driver_id );
		return (<tr>
			<td>{formatDateTime( time.local( s.time_started ) )}</td>
			<td>{driver.call_id}</td>
			<td>{car.name}</td>
			<td><button type="button" className="btn btn-danger btn-xs" onClick={this.click.bind(this)}>Закрыть</button></td>
			</tr>);
	}
};


class CloseSessionDialog extends React.Component {
	accept() {
		var $s = $(ReactDOM.findDOMNode(this));
		var odometer = $s.find( 'input' ).val();
		return this.props.client.closeSession( this.props.driver.id, odometer );
	}
	render() {
		return (<AppDialog
			id={this.props.id}
			title={'Закрытие смены для ' + this.props.driver.call_id}
			yes="Закрыть"
			no="Отменить"
			onAccept={this.accept.bind(this)}>
			<div className="form-group">
				<label>Одометр</label>
				<input className="form-control" type="number" min="0" step="1" />
			</div>
		</AppDialog>);
	}
};

/*
 * Returns text description of a session-related error code.
 */
function sessionError( code ) {
	var messages = {
		"open": "Смена уже открыта",
		"no_car": "Водителю не назначена машина"
	};
	if( code in messages ) return messages[code];
	return "Ошибка: " + code;
}
