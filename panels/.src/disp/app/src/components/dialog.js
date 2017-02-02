var React = require('react'), ReactDOM = require('react-dom');

/*
 * Generic dialog. The properties are:
 * title, yes, onAccept, no, onDecline
 */
export default class Dialog extends React.Component {
	render() {
		return (
			<div className="dialog">
				<div className="title">{this.props.title}</div>
				<div className="content">{this.props.children}</div>
				<div className="buttons">
					{this.props.yes &&
						<button type="button" onClick={this.props.onAccept}>{this.props.yes}</button>}
					<button type="button" onClick={this.props.onDecline}>{this.props.no}</button>
				</div>
			</div>
		);
	}
};
