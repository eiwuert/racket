import sounds from '../lib/sounds.js';
import toast from '../lib/toast.js';
import Dialog from '../lib/dialog.js';

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
	$c.append( soundSection(disp) );

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


function soundSection(disp)
{
	var s = '<div>\
		<label>Громкость звуков</label>\
		<input type="range" min="0.0" max="1.0"\
			step="0.01">\
		<button type="button">Проверка</button>\
	</div>';
	var $c = $( s );

	var $range = $c.find( 'input' );
	var $button = $c.find( 'button' );

	var vol = disp.getSetting( "sound-volume", 0.5 )
	$range.val( vol );
	$range.on( "change", function() {
		sounds.vol( this.value );
		disp.changeSetting( "sound-volume", this.value );
	});

	$button.on( "click", function() {
		var b = this;
		b.disabled = true;
		testSound.play();
		setTimeout( function() {
			testSound.stop();
			b.disabled = false;
		}, 3000 );
	});
	return $c;
}