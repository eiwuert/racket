var React = require('react');
var ReactDOM = require('react-dom');

import Group from '../components/order-form/address-group.js';

export default function AddressGroupSection( $container )
{
	var c = document.createElement('div');
	$container.append(c);
	var $c = $(c);
	
	var addr = {
		place: disp.param('default_city'),
		street: '',
		house: '',
		building: '',
		entrance: '',
		apartment: ''
	};
	var qid = '0';
	var locName = '';
	var location = null;

	function r() {
		ReactDOM.render(<Group
			qid={qid} onQueueChange={onQueueChange}
			addr={addr} onAddrChange={onAddrChange}
			locName={locName} onLocChange={onLocChange}/>, c);
	}
	r();
	
	function onAddrChange( newAddr ) {
		addr = newAddr;
		qid = null;
		location = null;
		locName = '';
		r();
	}
	
	function onQueueChange(newQid) {
		qid = newQid;
		location = null;
		locName = '';
		var loc = disp.getQueueLocation(qid);
		setAddr(loc ? loc.addr : null);
		r();
	}
	
	function onLocChange(val, item) {
		locName = val;
		location = item;
		setAddr( location ? location.addr : null );
		qid = null;
		r();
	}
	
	function setAddr(newAddr) {
		if(newAddr == null ) {
			newAddr = {
				place: "",
				street: "",
				house: "",
				building: "",
				entrance: "",
				apartment: ""
			};
		}
		addr = newAddr;
	}
	
	this.get = function()
	{
		var loc = disp.getQueueLocation(qid) || location;
		var locId = loc ? loc.loc_id : null;
		return {
			addr: addr,
			loc_id: locId
		};
	};

	this.set = function( spec )
	{
		setAddr( spec.addr );
		qid = locQueue(spec.loc_id);
		r();
	};

	function locQueue( loc_id ) {
		if( !loc_id ) return null;
		var q = disp.queues();
		for( var i = 0; i < q.length; i++ ) {
			if( q[i].loc_id == loc_id ) {
				return q[i].id;
			}
		}
		return null;
	}

	this.setQueue = function( newQid )
	{
		qid = newQid;
		var loc = disp.getQueueLocation(qid);
		if( loc ) {
			location = loc;
			locName = loc ? loc.name : '';
			setAddr( loc.addr );
		}
		r();
	};

	this.slideToggle = function() {
		$c.slideToggle( 'fast' );
	};

	this.hide = function() {
		$c.hide();
	};
}
