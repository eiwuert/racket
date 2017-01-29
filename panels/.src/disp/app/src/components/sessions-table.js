var React = require('react');
var ReactDOM = require('react-dom');

import {formatDateTime} from '../../lib/format.js';
import sounds from '../../lib/sounds.js';
import AppDialog from './app-dialog.js';

export default class SessionsTable extends React.Component {
	openClick() {
		window.__open(<OpenSessionDialog client={this.props.client} />, 'open-session');
	}
	render() {
		return (<div className="sessions-table">
			<button type="button" onClick={this.openClick.bind(this)}>Открыть смену</button>
			<Table client={this.props.client}/>
		</div>);
	}
};

class Table extends React.Component {
	componentDidMount() {
		var t = this;
		var disp = t.props.client;

		disp.on( 'sessions-changed', function() {
			t.forceUpdate();
		});

		disp.on( 'session-requested', function( event ) {
			var r = event.data;
			window.__open(<SessionRequestDialog
				client={disp}
				driverId={r.driver_id}
				odometer={r.odometer} />, 'session-request-' + r.driver_id);
		});
	}

	render() {
		var disp = this.props.client;
		return (<table className="items">
		<thead><tr><th>Начало</th>
		<th>Водитель</th>
		<th>Машина</th>
		<th></th></tr>
		</thead>
		<tbody>
			{ disp.sessions().map(s => <Row key={s.session_id} session={s} client={this.props.client}/>) }
		</tbody>
		</table>);
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
			<td><button type="button" onClick={this.click.bind(this)}>Закрыть</button></td>
			</tr>);
	}
};

class OpenSessionDialog extends React.Component {
	accept() {
		var $s = $(ReactDOM.findDOMNode(this));
		var $id = $s.find( 'select' );
		var $km = $s.find( 'input' );
		
		var driver_id = $id.val();
		var odometer = $km.val();
		console.log(driver_id, odometer);
		if( driver_id == '0' ) {
			toast( "Не выбран водитель" );
			return false;
		}

		return disp.openSession( driver_id, odometer )
			.catch( function( error ) {
				alert(sessionError( error ));
				throw error;
			});
	}
	render() {
		return (
			<AppDialog id={this.props.id} yes="Открыть" no="Отменить" onAccept={this.accept.bind(this)}>
				<div>
					<label>Водитель</label>
					<UnadmittedDriversList client={this.props.client} />
				</div>
				<div>
					<label>Одометр</label>
					<input type="number" min="0" step="1" />
				</div>
			</AppDialog>);
	}
};

// List of drivers who need their session opened
class UnadmittedDriversList extends React.Component {
	render() {
		var disp = this.props.client;
		var list = disp.drivers().filter(d => disp.sessionRequired(d.id));
		return (
			<select>
				<option value="0"></option>
				{list.map(d => <option key={d.id} value={d.id}>{d.call_id} - {d.surname()}</option>)}
			</select>
		);
	}
};

class CloseSessionDialog extends React.Component {
	accept() {
		var $s = $(ReactDOM.findDOMNode(this));
		var odometer = $s.find( 'input' ).val();
		return this.props.client.closeSession( this.props.driver.id, odometer );
	}
	render() {
		return (
			<AppDialog
				id={this.props.id}
				title={'Закрытие смены для ' + this.props.driver.call_id}
				yes="Закрыть"
				no="Отменить"
				onAccept={this.accept.bind(this)}>
				<div><label>Одометр</label><input type="number" min="0" step="1" /></div>
			</AppDialog>
		);
	}
};

class SessionRequestDialog extends React.Component {
	constructor(props) {
		super(props);
		this.sound = sounds.track( "/res/dispatcher/phone.ogg" );
	}

	accept() {
		var disp = this.props.client;
		var driver_id = this.props.driverId;
		var odometer = this.props.odometer;
		
		this.sound.stop();

		return disp.openSession( driver_id, odometer )
			.catch( function( error ) {
				/*
				 * If the error is that the session already exists,
				 * consume it and treat the request as successful.
				 */
				if( error == "open" ) {
					return null;
				}
				/*
				 * If not, pass the error along.
				 */
				alert(sessionError(error));
				throw error;
			})
	}
	
	componentDidMount() {
		this.sound.play();
	}
	
	componentWillUnmount() {
		this.sound.stop();
	}

	render() {
		var disp = this.props.client;
		var driver_id = this.props.driverId;
		var d = disp.getDriver( driver_id );
		return (<AppDialog yes="Разрешить" no="Игнорировать" onAccept={this.accept.bind(this)}>
			Водитель {d.call_id} желает открыть смену
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
