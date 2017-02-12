import './lib/autocomplete.js';
import './lib/mapdata.js';
import './lib/html5.js';
import http from './lib/http.js';
import './core/disp.js';

var React = require('react');
var ReactDOM = require('react-dom');

import App from './components/app.js';

var pref = 'http://taxi.loc/dx/dispatcher/';

class Container extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			wait: false,
			loading: false,
			ok: false
		};
	}

	login(name, password) {
		this.setState({wait: true});
		http.post(pref + 'login', {name, password})
			.then(response => {
				if(response.errno) {
					throw response.errstr;
				}
				localStorage.setItem('name', name);
				localStorage.setItem('password', password);
				window.disp = new DispatcherClient({token: response.data.token});
				this.setState({ok: true, wait: false, loading: true});
				return new Promise(function(ok) {
					window.disp.on('ready', ok);
				});
			})
			.catch(error => {
				alert(error);
			})
			.then(() => {
				this.setState({wait: false, loading: false});
			});
	}

	componentDidMount() {
		if(this.props.login) {
			this.login(this.props.login, this.props.password);
		}
	}

	render() {
		if(this.state.wait) {
			return <p>Logging in...</p>;
		}
		if(this.state.loading) {
			return <p>Loading client...</p>;
		}
		if(this.state.ok) {
			return <App client={disp}/>
		}
		return <LoginForm onSubmit={this.login.bind(this)}/>
	}
};

class LoginForm extends React.Component {
	submit(event) {
		event.preventDefault();
		var $form = $(ReactDOM.findDOMNode(this));
		var name = $form.find('input').eq(0).val();
		var pass = $form.find('input').eq(1).val();
		this.props.onSubmit(name, pass);
	}

	render() {
		return (<form onSubmit={this.submit.bind(this)}>
			<div className="form-group">
				<label>Имя</label>
				<input className="form-control"/>
			</div>
			<div className="form-group">
				<label>Пароль</label>
				<input type="password" className="form-control"/>
			</div>
			<button>Войти</button>
		</form>);
	}
};

$(document).ready(function() {
	var name = localStorage.getItem('name');
	var password = localStorage.getItem('password');
	ReactDOM.render(
		<Container login={name} password={password} />,
		document.getElementById('app-container')
	);
});
