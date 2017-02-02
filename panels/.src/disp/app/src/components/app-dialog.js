var React = require('react');
var ReactDOM = require('react-dom');
var Promise = window.Promise;

export default class AppDialog extends React.Component {
	constructor(props) {
		super(props);
		if(!props.id) {
			throw new Error("Missing `id` property. Pass `this.props.id` to the AppDialog.");
		}
	}

	accept() {
		var id = this.props.id;
		var val = this.props.onAccept();
		if(val === false) {
			window.__close(id);
			return;
		}

		Promise.resolve(val).then(function() {
			window.__close(id);
		});
	}

	decline() {
		var id = this.props.id;
		if(!this.props.onDecline) {
			window.__close(id);
			return;
		}
		Promise.resolve(this.props.onDecline())
		.then(function() {
			window.__close(id);
		});
	}

	render() {
		return (
			<div className="dialog" ref={r => this.root = r}>
				<div className="title">{this.props.title}</div>
				<div className="content">{this.props.children}</div>
				<div className="buttons">
					{this.props.yes &&
						<button type="button" onClick={this.accept.bind(this)}>{this.props.yes}</button>}
					<button type="button" onClick={this.decline.bind(this)}>{this.props.no}</button>
				</div>
			</div>
		);
	}
};
