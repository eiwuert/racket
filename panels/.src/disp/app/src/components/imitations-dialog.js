var React = require('react'), ReactDOM = require('react-dom');

export default class ImitationsDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			list: this.getList()
		};
	}

	getList() {
		return disp.drivers().filter( function( d ) {
			return d.is_fake == 1 && !d.online();
		});
	}

	select(driver) {
		var id = driver.id;
		disp.setDriverOnline( id, true ).catch( function( error ) {
			Dialog.show( "Ошибка: " + error );
		});
	}

	render() {
		return (<Dialog title="Добавление имитации" no="Закрыть" onDecline={this.props.onDecline}>
			<DriversMenu drivers={this.state.list} onSelect={this.select}/>
		</Dialog>);
	}
};

class DriversMenu extends React.Component {
	constructor(props) {
		super(props);
		this.click = this.click.bind(this);
	}

	click(e) {
		var id = e.target.dataset['id'];
		var driver = this.props.drivers.find(d => d.id == id);
		this.props.onSelect(driver);
	}

	render() {
		var t = this;
		return (<div className="menu">{
			this.props.drivers.map(function(d) {
				return <div data-id={d.id} key={d.id} onClick={t.click}>{d.call_id}</div>;
			})
		}</div>);
	}
};


class Dialog extends React.Component {
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
