
import html from '../../lib/html.js';

var React = require('react');
var ReactDOM = require('react-dom');

import Postpone from '../components/order-form/postpone.js';

export default function PostponeSection( $container )
{
	var $top = $( html.checkbox( "Отложить заказ" ) );
	var $checkbox = $top.filter( "input" ).eq(0);

	var $sub = $( '<div></div>' );
	$container.append( $top );
	$container.append( $sub );
	
	var s = {
		disabled: true,
		time: 0,
		remind: 0
	};

	function r() {
		ReactDOM.render(<Postpone
			disabled={s.disabled}
			time={s.time}
			remind={s.remind}
			onTimeChange={onTimeChange}
			onRemindChange={onRemindChange}
			/>, $sub.get(0));
	}
	
	function onTimeChange(e) {
		var t = parseTime(e.target.value);
		if(!t) return;
		s.time = t;
		r();
	}
	
	function onRemindChange(e) {
		s.remind = e.target.value;
		r();
	}

	
	$checkbox.on( 'change', function() {
		s.disabled = !this.checked;
		if(!s.disabled) {
			s.time = time.utc();
			s.remind = 0;
		}
		r();
	});

	this.get = function()
	{
		if(!s.disabled) {
			return {
				exp_arrival_time: s.time,
				reminder_time: s.time - s.remind * 60
			};
		}
		return {
			exp_arrival_time: null,
			reminder_time: null
		};
	};

	this.set = function( order )
	{
		if( order.exp_arrival_time )
		{
			$checkbox.prop( 'checked', true );
			s.disabled = false;
			s.time = order.exp_arrival_time;
			s.remind = Math.round((order.exp_arrival_time - order.reminder_time)/60);
		}
		else {
			$checkbox.prop( 'checked', false );
			s.disabled = true;
		}
		r();
	};
}

function parseTime(dt) {
	var d = parseDateTime(dt);
	if(!d) return null;
	return time.utc(Math.round(d.getTime()/1000));
}

/*
 * Parses a string like "2000-01-01T00:00[:00]" and returns a Date
 * object.
 */
function parseDateTime( dt )
{
	var re = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)$/;
	var match = dt.match( re );
	if( !match ) {
		re = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d)$/;
		match = dt.match( re );
	}

	if( !match ) return null;

	var Y = match[1];
	var M = match[2] - 1; /* 0-based, surprise! */
	var D = match[3];
	var h = match[4];
	var m = match[5];
	var s = (match.length > 6)? match[6] : 0;
	var d = new Date( Y, M, D, h, m, s );
	return d;
}