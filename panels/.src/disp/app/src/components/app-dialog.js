var React = require('react');
var ReactDOM = require('react-dom');

export default class AppDialog extends React.Component {
	constructor(props) {
		super(props);
		if(!props.id) {
			throw new Error("Missing `id` property");
		}
	}

	accept() {
		var id = this.props.id;
		Promise.resolve(this.props.onAccept())
		.then(function() {
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
					<button type="button" onClick={this.accept.bind(this)}>{this.props.yes}</button>
					<button type="button" onClick={this.decline.bind(this)}>{this.props.no}</button>
				</div>
			</div>
		);
	}
};
