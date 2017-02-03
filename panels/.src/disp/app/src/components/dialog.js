var React = require('react'), ReactDOM = require('react-dom');

/*
 * Generic dialog. The properties are:
 * title, yes, onAccept, no, onDecline, yesClass
 */
export default class Dialog extends React.Component {
	componentDidMount() {
		$(this.root).draggable();
	}
	render() {
		return (
			<div className="dialog" ref={r => this.root = r}>
				<div className="title">{this.props.title}</div>
				<div className="content">{this.props.children}</div>
				<div className="buttons">
					{this.props.yes &&
						<button type="button"
							className={'btn ' + this.props.yesClass}
							onClick={this.props.onAccept}>{this.props.yes}</button>}
					<button type="button"
						className="btn"
						onClick={this.props.onDecline}>{this.props.no}</button>
				</div>
			</div>
		);
	}
};
Dialog.defaultProps = {
	yesClass: 'btn-primary'
};
