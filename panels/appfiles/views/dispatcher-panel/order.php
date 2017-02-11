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
require_script( 'res/dispatcher/dispatcher.js' );

require_stylesheet('res/lib/bootstrap/css/bootstrap.min.css');
require_stylesheet('res/lib/bootstrap/css/bootstrap-theme.min.css');
require_script('res/lib/bootstrap/js/bootstrap.min.js');

require_script('res/lib/jquery-ui/jquery-ui.min.js');
require_stylesheet('res/lib/jquery-ui/jquery-ui.min.css');
?>
</head>
<body>

<div id="app-container"></div>

</body>
</html>
