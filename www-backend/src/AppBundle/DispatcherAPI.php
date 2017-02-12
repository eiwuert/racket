<?php

namespace AppBundle;

class DispatcherAPI
{
	function __construct($db)
	{
		$this->db = $db;
	}

	function checkToken($token)
	{
		return $this->db->fetchColumn('
			SELECT acc_id FROM taxi_accounts
			WHERE token = :token
				AND token_expires > NOW()
				AND `type` = :type
			LIMIT 1', [
				'token' => $token,
				'type' => 'dispatcher'
				]
		);
	}

	function driverPosition($driver_id)
	{
		$r = $this->db->fetchAssoc("SELECT latitude, longitude
			FROM taxi_accounts JOIN taxi_drivers USING (acc_id)
			WHERE acc_id = ?", [$driver_id]);
		if (!$r) {
			return array();
		}
		return array(
			'lat' => $r['latitude'],
			'lon' => $r['longitude']
		);
	}

	/*
	 * The flow of messages from the server to dispatchers is emulated
	 * using the "channel" which is a database table. Whenever the server
	 * needs to send a message to one or all dispatchers, it puts it in a
	 * next row. Dispatchers, using this request, periodically scan the
	 * table and unpack new messages.
	 */
	function getChannelMessages($acc_id, $start_message_id)
	{
		$A = $this->db->fetchAll("
			SELECT message_id, message
			FROM taxi_channels
			WHERE message_id > :seq
				AND (acc_id IS NULL OR acc_id = :acc_id)
			ORDER BY message_id", [
			'seq' => $start_message_id,
			'acc_id' => $acc_id
			]
		);

		$messages = array();
		foreach ($A as $a) {
			$m = json_decode($a['message'], true);
			$m['message_id'] = $a['message_id'];
			$messages[] = $m;
		}
		return $messages;
	}

	function getChatMessages($driver_id, $since, $until)
	{
		$r = $this->db->fetchAll(
			"SELECT
				msg.msg_id AS id,
				msg.text,
				msg.to,
				msg.to_type,
				UNIX_TIMESTAMP(msg.t) AS utc,
				sender.acc_id AS `from`
			FROM taxi_chat msg
			JOIN taxi_accounts sender
				ON msg.from = sender.acc_id
			WHERE
				-- time period
				msg.t BETWEEN FROM_UNIXTIME(:since) AND FROM_UNIXTIME(:until)
				-- scope
				AND (
					-- from any dispatcher to the driver
					(sender.type = 'dispatcher' AND msg.to = :driver_id)
					-- or from the driver to all dispathers
					OR (sender.acc_id = :driver_id AND msg.to_type = 'dispatcher')
				)
			ORDER BY msg.t
			", ['since' => $since, 'until' => $until, 'driver_id' => $driver_id]
		);

		cast::table($r, array(
			'int id',
			'str text',
			'int? to',
			'str? to_type',
			'int utc',
			'int from'
		));

		return $r;
	}

	function customerInfo($phone)
	{
		$info = $this->db->fetchAssoc("
			SELECT customer_id, name, blacklist
			FROM taxi_customers
			WHERE phone = ?", [$phone]);

		if (isset($info['customer_id'])) {
			$orders = $this->db->fetchAll("
				SELECT DISTINCT o.src_addr
				FROM taxi_orders o
				WHERE customer_id = ?
				ORDER BY o.time_created DESC
				LIMIT 5", [$info['customer_id']]
			);
			$info['addresses'] = array();
			foreach ($orders as $r) {
				$info['addresses'][] = $this->parse_address($r['src_addr']);
			}
		}
		return $info;
	}

	private function parse_address($str)
	{
		$addr = address::parse_std($str);
		return array(
			'place' => $addr->place,
			'street' => $addr->format_street(),
			'house' => $addr->house_number,
			'building' => $addr->house_building,
			'entrance' => $addr->house_entrance,
			'apartment' => $addr->apartment
		);
	}

	private function channelSeq($acc_id)
	{
		$id = $this->db->fetchColumn("SELECT MAX(message_id)
			FROM taxi_channels
			WHERE acc_id IS NULL OR acc_id = ?", [$acc_id]);
		if (!$id)
			$id = '0';
		return $id;
	}

	private function fares()
	{
		$arr = $this->db->fetchAll("SELECT name, start_price, minimal_price,
			kilometer_price, slow_hour_price
			FROM taxi_fares
			WHERE deleted = 0");
		cast::table($arr, array(
			'str name',
			'int start_price',
			'int minimal_price',
			'int kilometer_price',
			'int slow_hour_price'
		));
		return $arr;
	}

	private function drivers()
	{
		$drivers = $this->db->fetchAll("
			SELECT
				acc.call_id,
				acc.work_phone AS phone,
				acc.name,
				acc.acc_id AS driver_id,
				d.group_id,
				d.type_id,
				d.car_id,
				d.is_fake,
				d.has_bank_terminal,
				d.is_online,
				UNIX_TIMESTAMP(d.block_until) AS block_until,
				d.block_reason,
				d.latitude,
				d.longitude,
				d.accept_new_orders = 0 AS is_busy
			FROM taxi_drivers d
			LEFT JOIN taxi_accounts acc USING (acc_id)
			WHERE acc.deleted = 0
		");
		cast::table($drivers, array(
			'int driver_id',
			'int group_id',
			'int? type_id',
			'int? car_id',
			'int is_fake',
			'int has_bank_terminal',
			'int is_online',
			'int is_busy',
			'int? block_until',
			'flt latitude',
			'flt longitude'
		));
		return $drivers;
	}

	private function cars()
	{
		$cars = $this->db->fetchAll("
			SELECT
				c.car_id,
				c.name,
				c.plate,
				c.group_id,
				c.body_type,
				c.color,
				c.class,
				acc.call_id AS driver_call_id,
				g.name AS group_name
			FROM taxi_cars c
			JOIN taxi_car_groups g USING (group_id)
			LEFT JOIN taxi_drivers d ON c.car_id = d.car_id
			LEFT JOIN taxi_accounts acc USING (acc_id)
			WHERE c.deleted = 0
			ORDER BY c.name"
		);
		cast::table($cars, array(
			'int car_id',
			'str name',
			'str plate',
			'str body_type',
			'str color'
		));
		return $cars;
	}

	private function queues()
	{
		$queues = $this->db->fetchAll("
			SELECT DISTINCT
			q.queue_id,
			q.parent_id,
			q.name,
			q.`order`,
			q.priority,
			q.`min`,
			q.latitude,
			q.longitude,
			q.loc_id
			FROM taxi_queues q
			ORDER BY q.parent_id,
				IF(q.parent_id IS NULL, q.`order`, q.priority)"
		);

		cast::table($queues, array(
			'int queue_id',
			'int parent_id',
			'str name',
			'int order',
			'int priority',
			'int min',
			'flt latitude',
			'flt longitude',
			'int? loc_id'
		));
		return $queues;
	}

	function init($acc_id)
	{
		$init = array();

		/*
		 * Who am I
		 */
		$init['who'] = array(
			'id' => $acc_id,
			'settings' => $this->db->fetchColumn("SELECT prefs FROM taxi_accounts
				WHERE acc_id = ?", [$acc_id])
		);

		$init["seq"] = $this->channelSeq($acc_id);
		$init["now"] = time();
		$init['fares'] = $this->fares();
		$init["drivers"] = $this->drivers();
		$init["cars"] = $this->cars();

		/*
		 * Driver groups
		 */
		$groups = $this->db->fetchAll("SELECT group_id, name
			FROM taxi_driver_groups");
		$groups_map = array();
		foreach ($groups as $g) {
			$id = $g['group_id'];
			$g['queues'] = array();
			$groups_map[$id] = $g;
		}

		/*
		 * Driver groups -> queues relations
		 */
		$r = $this->db->fetchAll("
			SELECT DISTINCT gr.group_id, q2.queue_id
			-- Get group-queue assignments
			FROM taxi_driver_groups gr
			LEFT JOIN taxi_driver_group_queues gq USING (group_id)

			-- Add parent queues to the list (they will not be in assignments)
			JOIN taxi_queues q USING (queue_id)
			LEFT JOIN taxi_queues q2
				ON q2.queue_id = q.queue_id
				OR q2.queue_id = q.parent_id");
		foreach ($r as $row) {
			$gid = $row['group_id'];
			$qid = intval($row['queue_id']);
			$groups_map[$gid]['queues'][] = $qid;
		}
		cast::table($groups_map, array(
			'int group_id'
		));
		$init["groups"] = array_values($groups_map);

		/*
		 * Driver types
		 */
		$init["driver_types"] = $this->db->fetchAll("SELECT type_id, name
			FROM taxi_driver_types");
		cast::table($init["driver_types"], array(
			'int type_id',
			'str name'
		));

		/*
		 * Driver queues
		 */
		$init["queues"] = $this->queues();

		/*
		 * Current queues assignments
		 */
		$init['queues_snapshot'] = $this->getQueuesSnapshot();

		/*
		 * Recent orders.
		 */
		$init["recent_orders"] = $this->recentOrders($acc_id);

		/*
		 * Locations associated with queues.
		 */
		$init["queue_locations"] = $this->queueLocations($acc_id);

		$areas = $this->db->fetchAll("
			SELECT name, min_lat, max_lat, min_lon, max_lon
			FROM taxi_service_areas");

		$options = $this->getOptions();

		/*
		 * Current driver alarms.
		 */
		$init['driver_alarms'] = $this->db->fetchAll("
			SELECT acc_id AS driver_id
			FROM taxi_drivers JOIN taxi_accounts USING (acc_id)
			WHERE alarm_time IS NOT NULL");

		$init['map_areas'] = $areas;
		$init['service_options'] = $options;
		$init['sessions'] = $this->getOpenSessions();
		return $init;
	}

	private function getOpenSessions()
	{
		return $this->db->fetchAll("
			SELECT
				id AS session_id,
				w.driver_id,
				w.car_id,
				UNIX_TIMESTAMP(w.time_started) AS time_started
			FROM taxi_works w
			JOIN taxi_accounts acc
				ON acc.acc_id = w.driver_id
			WHERE w.time_finished IS NULL
			AND acc.deleted = 0");
	}

	private function getOptions()
	{
		$defaults = array(
			'queue_dialogs' => '0',
			'queue_dialog_time' => '30',
			'restore_queues' => '1',
			'driver_orders' => '0',
			'mark_customers' => '0',
			'accept_timeout' => '10',
			'queue_drivers' => '2',
			'search_radius' => '3000',
			'search_number' => '1',
			'pool_enabled_queues' => '1',
			'pool_enabled_city' => '1',
			'publish_duration' => '20',
			'default_city' => 'Минск',
			'phrases_driver' => '',
			'phrases_dispatcher' => '',
			'session' => true,
			'imitations' => true,
			'service_logs' => true,
			'gps_tracking' => true
		);

		$a = $this->db->fetchAll("SELECT name, value
			FROM taxi_service_settings");
		$options = array_column($a, 'value', 'name');
		foreach ($defaults as $k => $v) {
			if (!array_key_exists($k, $options)) {
				$options[$k] = $v;
			}
		}
		return $options;
	}

	private function queueLocations($acc_id)
	{
		$locations = $this->db->fetchAll("
			SELECT
				loc.loc_id,
				loc.name,
				loc.address,
				loc.latitude,
				loc.longitude,
				loc.contact_phone,
				loc.contact_name,
				q.queue_id
			FROM taxi_queues q
			JOIN taxi_locations loc USING (loc_id)");
		return $this->formatLocations($locations);
	}

	private function formatLocations($locations)
	{
		foreach ($locations as $i => $loc) {
			cast::row($loc, array(
				'int loc_id',
				'str name',
				'int? queue_id',
				'str contact_phone',
				'str contact_name',
				'flt latitude',
				'flt longitude'
			));
			$loc['addr'] = $this->parse_address($loc['address']);
			$locations[$i] = $loc;
		}
		return $locations;
	}

	function orders($since, $until)
	{
		$rows = $this->db->fetchAll("
			SELECT
				o.order_uid,
				o.order_id,
				o.comments,
				o.status,
				o.src_addr,
				UNIX_TIMESTAMP( o.time_created ) AS time_created,
				-- owner
				cr.type AS creator_type,
				cr.acc_id AS creator_id,
				-- customer
				c.name AS customer_name,
				c.phone AS customer_phone,
				-- driver
				d.name AS driver_name,
				-- car
				car.name AS car_name
			FROM taxi_orders o
			LEFT JOIN taxi_customers c ON c.customer_id = o.customer_id
			LEFT JOIN taxi_accounts cr ON o.owner_id = cr.acc_id
			LEFT JOIN taxi_accounts d ON d.acc_id = o.taxi_id
			LEFT JOIN taxi_cars car ON car.car_id = o.car_id
			WHERE o.deleted = 0
				AND o.time_created BETWEEN FROM_UNIXTIME(?) AND FROM_UNIXTIME(?)
			ORDER BY o.order_id", [$since, $until]);
		$list = [];
		foreach($rows as $row) {
			$list[] = [
				'id' => $row['order_uid'],
				'num' => $row['order_id'],
				'comments' => $row['comments'],
				'status' => $row['status'],
				'timeCreated' => $row['time_created'],
				'sourceLocation' => [
					'address' => $row['src_addr'],
				],
				'creator' => [
					'type' => $row['creator_type'],
					'id' => $row['creator_id']
				],
				'customer' => [
					'name' => $row['customer_name'],
					'phone' => $row['customer_phone'],
				],
				'driver' => [
					'name' => $row['driver_name']
				],
				'car' => [
					'name' => $row['car_name']
				]
			];
		}
		return $list;
	}

	private function recentOrders($acc_id)
	{
		$orders = $this->db->fetchAll("
			SELECT
				o.order_uid,
				o.order_id,
				o.owner_id,
				o.taxi_id,
				o.src_loc_id,
				o.dest_loc_id,
				o.src_addr,
				o.dest_addr,
				o.comments,
				o.status,
				o.cancel_reason,
				UNIX_TIMESTAMP( o.time_created ) AS time_created,
				UNIX_TIMESTAMP( o.exp_arrival_time ) AS exp_arrival_time,
				UNIX_TIMESTAMP( o.reminder_time ) AS reminder_time,
				o.opt_vip,
				o.opt_terminal,
				o.opt_car_class,
				c.phone AS customer_phone,
				c.name AS customer_name
			FROM taxi_orders o
			LEFT JOIN taxi_customers c ON c.customer_id = o.customer_id
			LEFT JOIN taxi_accounts disp
				ON o.owner_id = disp.acc_id
				AND disp.type = 'dispatcher'
			WHERE o.deleted = 0
			AND (
				(o.`status` IN ('postponed', 'waiting', 'assigned', 'arrived', 'started'))
				OR TIMESTAMPDIFF(HOUR, o.time_created, NOW()) <= 24
			)
			ORDER BY o.time_created DESC
			"
		);

		foreach ($orders as $i => $order) {
			$src_addr = $this->parse_address($order['src_addr']);
			$order['src'] = array(
				'addr' => $this->parse_address($order['src_addr']),
				'loc_id' => $order['src_loc_id']
			);
			unset($order['src_addr']);
			unset($order['src_loc_id']);

			$order['dest'] = array(
				'addr' => $this->parse_address($order['dest_addr']),
				'loc_id' => $order['dest_loc_id']
			);

			unset($order['dest_addr']);
			unset($order['dest_loc_id']);

			$orders[$i] = $order;
		}
		cast::table($orders, array(
			"str order_uid",
			"int owner_id",
			"int? taxi_id",
			"int time_created",
			"int? exp_arrival_time",
			"int? reminder_time",
			"str status",
			"str comments",
			"str customer_name",
			"str customer_phone",
			"str opt_car_class",
			"int opt_vip",
			"int opt_terminal"
		));
		return $orders;
	}

	function findLocations($term)
	{
		$arr = $this->db->fetchAll(
			"SELECT
				loc_id,
				name,
				latitude,
				longitude,
				contact_name,
				contact_phone,
				address,
				NULL AS queue_id
			FROM taxi_locations loc
			WHERE loc.deleted = 0
			AND name LIKE ?
			AND loc_id NOT IN (
				SELECT loc_id
				FROM taxi_queues
				WHERE loc_id IS NOT NULL)
			ORDER BY loc.name
			LIMIT 10", ['%'.$term.'%']);
		return $this->formatLocations($arr);
	}

	function savePrefs($acc_id, $prefs)
	{
		$this->db->update('taxi_accounts', ['prefs' => $prefs], ['acc_id' => $acc_id]
		);
	}

	/*
	 * Returns service log messages for last `timeRange` seconds
	 */
	function getLastServiceMessages($timeRange)
	{
		return $this->db->fetchAll("
			SELECT
				message_id, `text`,
				UNIX_TIMESTAMP(t) AS t
			FROM taxi_logs
			WHERE TIMESTAMPDIFF(SECOND, t, NOW()) <= ?
			ORDER BY message_id", [$timeRange]);
	}

	function getQueuesSnapshot()
	{
		$q = "
			SELECT queue_id, driver_id, pos
			FROM taxi_queues q
			LEFT JOIN taxi_queue_drivers a
			USING (queue_id) ORDER BY pos";
		$rows = $this->db->fetchAll($q);

		$Q = array();
		foreach ($rows as $r) {
			$qid = $r['queue_id'];
			$id = $r['driver_id'];
			if (!isset($Q[$qid])) {
				$Q[$qid] = array(
					'queue_id' => $qid,
					'drivers' => array()
				);
			}
			if (!$id)
				continue;
			$Q[$qid]['drivers'][] = $id;
		}

		return array_values($Q);
	}

	function getCustomers($nameFilter, $phoneFilter)
	{
		return $this->db->fetchAll("SELECT name, phone
			FROM taxi_customers
			WHERE name LIKE ?
			AND phone LIKE ?
			LIMIT 10", ['%'.$nameFilter.'%', '%'.$phoneFilter.'%']);
	}

	function getToken($name, $password)
	{
		$row = $this->db->fetchAssoc("
			SELECT acc_id, password_hash
			FROM taxi_accounts
			WHERE `type` = 'dispatcher'
			AND deleted = 0
			AND login = ?", [$name]);
		if(!$row) return null;
		if(!password_verify($password, $row['password_hash'])) {
			return null;
		}
		$acc_id = $row['acc_id'];
		return $this->token($acc_id);
	}

	private function token($acc_id)
	{
		$token = md5(uniqid( true ));
		$this->db->executeUpdate("
			UPDATE taxi_accounts
			SET
				token = ?,
				token_expires = DATE_ADD(NOW(), INTERVAL 10 HOUR)
			WHERE acc_id = ?", [$token, $acc_id]);
		return $token;
	}
}
