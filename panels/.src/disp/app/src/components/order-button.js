var React = require('react');
var ReactDOM = require('react-dom');

import orderForms from '../order-form/forms.js';
import hotkeys from '../../lib/hotkeys.js';

export default class OrderButton extends React.Component {
	componentDidMount() {
		var $b = $(ReactDOM.findDOMNode(this));
		$b.on( "click", function() {
			$b.addClass( "active" );
			orderForms.show();
			setTimeout( function() {
				$b.removeClass( "active" );
			}, 100 );
		});
		hotkeys.bind( "ins", function() {
			$b.click();
		});
	}
	render() {
		return <button type="button" className="order-button btn btn-primary">Создать заказ (insert)</button>;
	}
};
