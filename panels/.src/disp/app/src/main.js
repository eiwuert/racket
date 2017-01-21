import initAlerts from './alarm.js';
import initReminderScript from './bookings-reminder.js';
import initCalls from './calls.js';
import initSettings from './settings.js';
import initSessions from './sessions.js';
import initChat from './chat/chat.js';
import orderForms from './order-form/forms.js';
import TabsWidget from './widgets/tabs.js';
import StatusBarWidget from './widgets/status-bar.js';
import ServiceLogWidget from './widgets/service-log.js';
import OrdersTableWidget from './widgets/orders-table.js';
import MapWidget from './widgets/map.js';
import DriversTableWidget from './widgets/drivers-table.js';
import CalculatorWidget from './widgets/calculator/calculator.js';
import OrdersWidget from './widgets/orders-list/orders-widget.js';
import initMonitorWidget from './widgets/monitor/monitor.js';
import hotkeys from '../lib/hotkeys.js';
import '../lib/autocomplete.js';
import '../lib/jobs.js';
import '../lib/mapdata.js';
import '../lib/html5.js';
import Dialog from '../lib/dialog.js';
import DX from './dx.js';


window.disp = new DispatcherClient();
disp.dx = new DX( '/dx/dispatcher' );

$( document ).ready( function()
{
	disp.on( "ready", function() {
		initWidgets();
		initReminderScript( disp );
		initCalls( disp );
	});
	disp.on( "connection-error", function( event ) {
		if( event.data.error == "Unauthorised" ) {
			alert( "Ваша сессия была закрыта сервером, перезагрузите страницу." );
			return;
		}
		alert( "Ошибка соединения: " + event.data.error );
	});
	disp.on( "sync", function( event ) {
		alert( "Ваша сессия была закрыта сервером, перезагрузите страницу." );
		return;
	});
});

function initWidgets()
{
	/*
	 * Status bar and the settings button.
	 */
	var sb = addWidget( StatusBarWidget, "status-bar-container" );
	initSettings( disp, sb );

	/*
	 * Order button
	 */
	var $b = $( '<button type="button" id="order-button">Создать заказ (insert)</button>' );
	$b.appendTo( $( "#order-button-container" ) );
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

	/*
	 * Orders list
	 */
	var orders = addWidget( OrdersWidget, "orders-container" );
	orders.on( "order-click", function( event ) {
		orderForms.show( event.data.order );
	});
	orders.on( "cancel-click", function( event ) {
		showCancelDialog( event.data.order );
	});

	/*
	 * Tabs
	 */
	initTabs();
}

function initTabs()
{
	var tabs = addWidget( TabsWidget, "tabs-container" );
	hotkeys.bind( 'alt+m', tabs.next );

	var monitor = initMonitorWidget( disp, tabs );
	initChat( disp, monitor.qw );

	var map = new MapWidget( disp );
	tabs.addTab( 'Карта', map.root() );
	tabs.PAGE_MAP = tabs.count() - 1;

	initAlerts( disp, tabs, map );

	var dw = new DriversTableWidget( disp );
	tabs.addTab( 'Водители', dw.root() );

	var orders = new OrdersTableWidget( disp );
	tabs.addTab( 'Заказы', orders.root() );

	var calc = new CalculatorWidget( disp );
	tabs.addTab( "Калькулятор", calc.root() );

	if( disp.sessionsEnabled() ) {
		initSessions( disp, tabs );
	}

	var log = new ServiceLogWidget( disp );
	tabs.addTab( 'Журнал', log.root() );
}

function addWidget( func, parentId )
{
	var w = new func( disp );
	document.getElementById( parentId ).appendChild( w.root() );
	return w;
}

/*
 * Dialog for order cancelling.
 */
function showCancelDialog( order )
{
	var html = '<p>Отменить заказ?</p>'
		+ '<textarea placeholder="Причина отмены"></textarea>';
	if( order.taxi_id ) {
		html += '<div><label><input type="checkbox"> Восстановить в очереди</label></div>';
	}
	var $content = $( '<div>' + html + '</div>' );
	var $reason = $content.find( 'textarea' );
	var $restore = $content.find( 'input[type="checkbox"]' );

	var d = new Dialog( $content.get(0) );
	d.addButton( 'Отменить заказ', cancel, 'yes' );
	d.addButton( 'Закрыть окно', null, 'no' );
	d.show();

	function cancel()
	{
		var reason = $reason.val();
		var restore = $restore.is( ':checked' );

		var p = disp.cancelOrder( order.order_uid, reason );
		if( restore && order.taxi_id ) {
			p.then( function() {
				disp.restoreDriverQueue( order.taxi_id )
			});
		}
		this.close();
	}
}
