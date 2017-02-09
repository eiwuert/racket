<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title><?= page_title() ?></title>
<?php
set_page_title( "Диспетчер " . user::get_login() );
require_script( 'res/lib/jquery.js' );
require_script( 'res/lib/leaflet/leaflet.js' );
require_script( 'res/lib/leaflet/leaflet.label.js' );
require_script( 'res/lib/fill.js' );
//require_stylesheet( 'res/lib/admin.css' );

require_stylesheet( 'res/dispatcher/main.css' );
require_stylesheet( 'res/dispatcher/dispatcher.css' );
require_script( 'res/dispatcher/main.js' );

require_stylesheet('res/lib/bootstrap/css/bootstrap.min.css');
require_stylesheet('res/lib/bootstrap/css/bootstrap-theme.min.css');
require_script('res/lib/bootstrap/js/bootstrap.min.js');

require_script('res/lib/jquery-ui/jquery-ui.min.js');
require_stylesheet('res/lib/jquery-ui/jquery-ui.min.css');
?>
</head>
<body>

<header>
	<nav>
		<h1>Диспетчер <?= user::get_login() ?></h1>
		<ul>
			<li><a href="<?= url( 'order' ) ?>">Отправка заказов</a></li>
			<li><a href="<?= url( 'online-cars' ) ?>">Водители на связи</a></li>
			<li><a href="<?= url( 'orders' ) ?>">Архив заказов</a></li>
			<li><a href="<?= url( 'log' ) ?>">Архив журнала</a></li>
			<li><a href="<?= url( 'clients' ) ?>">Клиенты</a></li>
			<li><a href="<?= aurl( 'logout' ) ?>">Выход</a></li>
		</ul>
	</nav>
</header>

<div id="app-container"></div>

</body>
</html>
