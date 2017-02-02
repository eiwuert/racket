import AppDialog from './app-dialog.js';
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
		return (<AppDialog id={this.props.id} title="Добавление имитации" no="Закрыть">
			<DriversMenu drivers={this.state.list} onSelect={this.select}/>
		</AppDialog>);
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
				return <div data-id={d.id} onClick={t.click}>{d.call_id}</div>;
			})
		}</div>);
	}
};
