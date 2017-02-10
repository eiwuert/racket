<?php

$acc_id = intval( user::get_id() );
$token = taxi_accounts::new_token($acc_id);
announce_json();
echo json_encode(['token' => $token]);
