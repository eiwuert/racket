import sounds from '../lib/sounds.js';
import toast from '../lib/toast.js';
import Dialog from '../lib/dialog.js';

var React = require('react');
var ReactDOM = require('react-dom');

var testSound = sounds.track( "/res/dispatcher/phone.ogg" );

export default function initSettings( disp )
{
	var dialog = null;
	applySettings();

	function applySettings() {
		sounds.vol( disp.getSetting( "sound-volume", 0.5 ) );
	}

	var $b = $('<button class="settings" style="position: absolute; right: 0; top: 0;">Настройки</button>');
	$(document.body).append($b);
	$b.on( "click", function()
	{
		if( dialog ) {
			dialog.focus();
			return;
		}
		
		dialog = createDialog(disp);
		dialog.on( "close", function() {
			dialog = null;
		});
		dialog.show();
	});
}

function createDialog(disp)
{
	var $c = $( '<div></div>' );
	
	ReactDOM.render(<SoundSection disp={disp} />, $c.get(0));

	var saveButton;
	var dialog = new Dialog( $c );
	dialog.setTitle( "Настройки" );
	saveButton = dialog.addButton( "Сохранить", function()
	{
		saveButton.disabled = true;
		disp.saveSettings().then( function() {
			toast( "Сохранено" );
			dialog.close();
			dialog = null;
		})
		.catch( function( err ) {
			Dialog.show( err );
			saveButton.disabled = false;
		});

	}, "yes" );
	dialog.addButton( "Отменить", null, "no" );
	return dialog;
}

class SoundSection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			volume: props.disp.getSetting('sound-volume', 0.5)
		};
		console.log(this.state);
	}

	onChange(e) {
		this.setState({volume: e.target.value});
		this.props.disp.changeSetting( "sound-volume", e.target.value );
		sounds.vol(e.target.value);
	}

	test(e) {
		var button = e.target;
		button.disabled = true;
		testSound.play();
		setTimeout(function() {
			testSound.stop();
			button.disabled = false;
		}, 2000);
	}

	render() {
		var disp = this.props.disp;
		//var parent = this.props.parent;
		return (
			<div>
				<label>Громкость звуков</label>
				<input type="range"
					min="0.0" max="1.0" step="0.01"
					value={this.state.volume}
					onChange={this.onChange.bind(this)}
					/>
				<button type="button" onClick={this.test.bind(this)}>Проверка</button>
			</div>
		);
	}
}
