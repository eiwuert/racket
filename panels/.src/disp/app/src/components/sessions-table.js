import {formatDateTime} from '../../lib/format.js';
import Dialog from './dialog.js';
var React = require('react');
var ReactDOM = require('react-dom');

export default class SessionsTable extends React.Component {
	constructor(props) {
		super(props);
		var disp = props.client;
		this.state = {
			sessions: disp.sessions(),
			closeDialog: false
		};
		this.refresh = this.refresh.bind(this);
		this.hideCloseDialog = this.hideCloseDialog.bind(this);
	}

	refresh() {
		this.setState({sessions: this.props.client.sessions()});
	}

	componentDidMount() {
		this.props.client.events.on('sessions-changed', this.refresh);
	}

	componentWillUnmount() {
		this.props.client.events.off('sessions-changed', this.refresh);
	}

	onCloseClick(s) {
		var disp = this.props.client;
		var driver = disp.getDriver( s.driver_id );
		/*
		 * If the driver is an imitation, close the session without
		 * asking.
		 */
		if( driver.is_fake == '1' ) {
			disp.closeSession( driver.id, 0 );
			return;
		}
		/*
		 * If the driver is real, ask for the odometer value before
		 * closing.
		 */
		this.setState({closeDialog: driver});
	}

	hideCloseDialog() {
		this.setState({closeDialog: null});
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
				<tbody>{
					disp.sessions().map(s => <Row
						client={this.props.client}
						key={s.session_id}
						session={s}
						onCloseClick={this.onCloseClick.bind(this)}/>)
				}</tbody>
			</table>
			{this.state.closeDialog &&
				<CloseSessionDialog
					client={this.props.client}
					driver={this.state.closeDialog}
					onAccept={this.hideCloseDialog}
					onDecline={this.hideCloseDialog}/>
			}
		</div>);
	}
};

class Row extends React.Component {
	click() {
		this.props.onCloseClick(this.props.session);
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
			<td><button type="button" className="btn btn-xs" onClick={this.click.bind(this)}>Закрыть</button></td>
			</tr>);
	}
};

class CloseSessionDialog extends React.Component {
	accept() {
		var $s = $(ReactDOM.findDOMNode(this));
		var odometer = $s.find( 'input' ).val();
		this.props.client.closeSession( this.props.driver.id, odometer );
		this.props.onAccept();
	}
	render() {
		return (<Dialog
			id={this.props.id}
			title={'Закрытие смены для ' + this.props.driver.call_id}
			yes="Закрыть"
			no="Отменить"
			onAccept={this.accept.bind(this)}
			onDecline={this.props.onDecline}>
			<div className="form-group">
				<label>Одометр</label>
				<input className="form-control" type="number" min="0" step="1" />
			</div>
		</Dialog>);
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
