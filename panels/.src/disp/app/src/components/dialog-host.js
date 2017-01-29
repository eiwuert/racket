var React = require('react');
var ReactDOM = require('react-dom');

export default class DialogHost extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dialogs: []
		};
		window.__open = this.showDialog.bind(this);
		window.__close = this.closeDialog.bind(this);
		this.id = 1;
	}
	
	showDialog(d, id) {
		if(!id) id = this.id++;
		
		if(this.state.dialogs.some(o => o.id == id)) {
			return;
		}

		this.setState(function(prevState) {
			prevState.dialogs.push({
				component: d,
				id: id
			});
			return prevState;
		});
	}

	closeDialog(id) {
		this.setState(function(prevState) {
			var pos = prevState.dialogs.findIndex(o => o.id == id);
			if(pos < 0) return prevState;
			prevState.dialogs.splice(pos, 1);
			return prevState;
		});
	}
	
	componentDidMount() {
		var container = ReactDOM.findDOMNode(this);
		initDragging(container);
	}

	render() {
		return (<div className="dialogs-host">
			{this.state.dialogs.map(d => 
				React.cloneElement(d.component, {key: d.id, id: d.id})
			)}
		</div>);
	}
};

function initDragging(host) {
	var $h = $(host);
	var $dragElement = null;
	var dragOffset = [0, 0];
	
	function targetDialog( event )
	{
		var $t = $(event.target);
		if( !$t.hasClass('dialog') ) {
			$t = $t.parents('.' + 'dialog');
		}
		return $t.length ? $t : null;
	}

	$h.on('mousedown', function(event) {
		var $t = targetDialog(event);
		if(!$t) {
			return;
		}
		event.preventDefault();

		$dragElement = $t;
		var off = $t.offset();
		dragOffset = [
			event.pageX - off.left,
			event.pageY - off.top
		];
	});
	
	$(window).on('mouseup', function() {
		$dragElement = null;
	});
	
	$(window).on('mousemove', function(event) {
		if(!$dragElement) return;
		var x = event.pageX - dragOffset[0];
		var y = event.pageY - dragOffset[1];
		$dragElement.css({
			left: x,
			top: y
		});
	});
		
}
