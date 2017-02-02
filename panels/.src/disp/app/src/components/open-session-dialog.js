import Dialog from './dialog.js';
import DriverSelector from './driver-selector.js';
var React = require('react'), ReactDOM = require('react-dom');

/*
 * Dialog for opening a new driver's session
 */
export default class OpenSessionDialog extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			driverId: 0
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

	onDriverChange(driverId) {
		this.setState({driverId});
	}

	render() {
		var cn = 'form-group';
		if(this.state.noDriver) {
			cn += ' has-error';
		}

		var list = disp.drivers().filter(d => disp.sessionRequired(d.id));

		return (
			<Dialog yes="Открыть" onAccept={this.accept.bind(this)}
				no="Отменить" onDecline={this.props.onDecline}>
				<DriverSelector
					drivers={list}
					value={this.state.driverId}
					onChange={this.onDriverChange.bind(this)}/>
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
