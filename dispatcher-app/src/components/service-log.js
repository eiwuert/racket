var React = require('react');
var ReactDOM = require('react-dom');

/*
 * This widget allows changing the time range of the messages (like
 * Skype does). When a change occurs, we have to get the history from
 * the database.
 *
 * While we are waiting for the history, we continue receiving messages
 * directly from the server. After the dump comes in, it may miss some
 * or all of the messages we have received during the request, so we
 * have to merge the realtime messages with the received history.
 */

function merge(history, latest) {
	if(history.length == 0 || latest.length == 0) {
		return history.concat(latest);
	}

	var lastHistory = history[history.length-1].message_id;
	while(latest.length > 0 && latest[0].message_id <= lastHistory) {
		latest.shift();
	}

	return history.concat(latest);
}

export default class ServiceLog extends React.Component {
	constructor(props) {
		super(props);

		this.request = null;
		// Messages to be merged with the dump
		this.merge = [];

		this.state = {
			range: 1, // hours
			messages: []
		};
		this.pushMessage = this.pushMessage.bind(this);
	}

	setRange(event) {
		this.setState({range: event.target.value});
		this.load(event.target.value);
	}

	load(range) {
		if(this.request) {
			this.request.abort();
		}
		this.request = disp.dx.get('service-log', {timeRange: range * 3600})
			.then(history => {
				this.request = null;
				this.setState({messages: merge(history, this.merge)})
				this.merge = [];
			})
			.catch(error => {
				console.error(error);
				this.request = null;
				this.merge = [];
			});
	}

	pushMessage(event) {
		var message = {
			message_id: event.data.message_id,
			text: event.data.text
		};

		/*
		 * If a history query is in progress, add the message
		 * to the merge buffer.
		 */
		if(this.request) {
			this.merge.push(message);
		}
		/*
		 * Meanwhile render the message
		 */
		this.setState(function(s) {
			var list = s.messages;
			list.push(message);
			return {messages: list};
		});
	}

	componentWillMount() {
		this.load(this.state.range);
		this.props.client.events.on('service-log', this.pushMessage);
	}

	componentWillUnmount() {
		this.props.client.events.off('service-log', this.pushMessage);
	}

	render() {
		var vals = [
			{val: 1, name: "1 час"},
			{val: 4, name: "4 часа"},
			{val: 24, name: "Сутки"},
			{val: 24*30, name: "Месяц"}
		];
		return (<div>
			<div>
				<label>Диапазон</label>
				<select className="form-control"
					value={this.state.range}
					onChange={this.setRange.bind(this)}>
					{vals.map(v => <option key={v.val} value={v.val}>
						{v.name}</option>)}
				</select>
			</div>
			{this.state.messages.map(m => <p key={m.message_id}>{m.text}</p>)}
		</div>);
	}
};
