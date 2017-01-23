var React = require('react');
var ReactDOM = require('react-dom');

export default Toolbar;

class Toolbar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			rtt: 0
		};
	}

	componentWillMount() {
		var disp = this.props.disp;
		var t = this;
		this.timer = setInterval( function() {
			t.setState({rtt: disp.RTT()});
		}, 1000);
	}

	render() {
		return (
			<div id="status-bar">
				<div className="indicators">
					<span className="rtt">{this.state.rtt} мс</span>
					{this.state.rtt > 5000?
						<span className="no-ping">Нет связи с сервером</span> : null}
				</div>
				<div className="buttons"></div>
			</div>
		);
	}
}
