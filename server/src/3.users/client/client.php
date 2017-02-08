<?php

define('T_CLIENT', 'client');

add_auth_func(function($cid, $str) {
	$m = message::parse_from_json($str);
	if (!$m || $m->command != 'auth-client') {
		return null;
	}
	write_message($cid, new message('auth-ok'));
	return new conn_user(T_CLIENT, null, 26);
});

add_cmdfunc(T_CLIENT, 'auth-client', function() {
	// Nothing
});

add_cmdfunc(T_CLIENT, 'register', function($msg) {
	pass($msg, 'client_register');
});

function client_error($msg) {
	return [
		'error' => $msg,
		'data' => null
	];
}

function client_data($data) {
	return [
		'error' => '',
		'data' => $data
	];
}

function client_register($msg)
{
	$name = $msg->data('name');
	$phone = $msg->data('phone');
	if(!$name || !$phone) {
		return client_error('Missing name or phone');
	}

	$id = uniqid();
	DB::insertRecord('taxi_accounts', [
		'service_id' => 26,
		'type' => 'client',
		'login' => $id,
		'password_hash' => '',
		'name' => $name,
		'personal_phone' => $phone,
		'prefs' => '{}'
	]);
	return client_data(['userId' => $id]);
}

add_cmdfunc(T_CLIENT, 'user-info', function($msg, $user) {
	pass($msg, 'client_info');
});

function client_info($msg) {
	$acc_id = client_get_user_id($msg);
	if(!$acc_id) {
		return client_data(null);
	}
	
	$acc = new taxi_account($acc_id);
	
	
	$last_order_id = DB::getValue("
		SELECT order_id FROM taxi_orders
		WHERE owner_id = %d
		ORDER BY order_id DESC
		LIMIT 1", $acc_id);
	if($last_order_id) {
		$last_order = client_get_order_object($last_order_id);
	}
	else {
		$last_order = null;
	}

	return client_data([
		'name' => $acc->name(),
		'phone' => $acc->personal_phone(),
		'lastOrder' => $last_order
	]);
}

function client_get_order_object($id)
{
	$order = DB::getRecord("
		SELECT
			o.order_uid AS id,
			o.taxi_id,
			o.car_id,
			o.src_addr,
			o.`status`,
			'Jack Torrance' AS driver_name,
			c.name AS car_name,
			c.color AS car_color,
			c.plate AS car_plate
		FROM taxi_orders o
		LEFT JOIN taxi_drivers d ON o.taxi_id = d.driver_id
		LEFT JOIN taxi_cars c ON o.car_id = c.car_id
		WHERE order_id = %d", $id);

	if($order['taxi_id']) {
		$cab = [
			'driver' => [
				'name' => $order['driver_name']
			],
			'car' => [
				'name' => $order['car_name'],
				'color' => $order['car_color'],
				'plate' => $order['car_plate']
			]
		];
	}
	else {
		$cab = null;
	}

	return [
		'id' => $order['id'],
		'status' => $order['status'],
		'house' => 'house',
		'street' => 'street',
		'cab' => $cab
	];
}

add_cmdfunc(T_CLIENT, 'create-order', function($msg, $user) {
	pass($msg, 'client_make_order');
});

function client_make_order($msg) {
	$user_id = client_get_user_id($msg);

	$order = new order();
	$order->service_id(26);
	$order->owner_id($user_id);
	$order->order_uid(uniqid('client', true));
	$order->src_addr('г. Минск, ул. Казинца, д. 64');
	$order->latitude(53.16);
	$order->longitude(27.14);
	$order_id = save_order($order);

	logmsg("Client order: $order");
	service_log(26, "Client order: $order");

	if (!wait_order($order)) {
		return client_error('order failed');
	}

	$cars = disp_search::find_cars($order);
	send_order($order, $cars, function($order) {
		drop_order($order);
	});
	return client_data(client_get_order_object($order_id));
}

add_cmdfunc(T_CLIENT, 'get-order', function($msg, $user) {
	pass($msg, 'client_get_order');
});

function client_get_order($msg) {
	$id = client_get_order_id($msg);
	return client_data(client_get_order_object($id));
}

function client_get_order_id($msg) {
	$acc_id = client_get_user_id($msg);
	$order_uid = $msg->data('orderId');
	return DB::getValue("SELECT order_uid FROM taxi_orders
		WHERE owner_id = %d AND order_id = %d",
		$acc_id, $order_uid);
}

function client_get_user_id($msg) {
	$user_id = $msg->data('userId');
	return DB::getValue("SELECT acc_id FROM taxi_accounts
		WHERE login = '%s' AND `type` = 'client'",
		$user_id);
}

add_cmdfunc(T_CLIENT, 'cancel-order', function($msg, $user) {
	pass($msg, 'client_cancel_order');
});

function client_cancel_order($msg)
{
	$order_id = client_get_order_id($msg);
	$order = new order($order_id);

	if (cancel_order($order)) {
		logmsg("Order cancelled: $order", $user->sid);
		service_log($user->sid, 'Order cancelled: {O}', $order);
	}
	else {
		logmsg("Couldn't cancel order: $order", $user->sid);
		return client_error('cancel failed');
	}
	return client_data('ok');
}


function pass($msg, $f) {
	$data = $f($msg);
	if(!isset($data['error'])) {
		
	}
	if(!isset($data['error'])) {
		$data['error'] = '';
	}
	write_message($msg->cid, new message('response', $data));
}


?>
