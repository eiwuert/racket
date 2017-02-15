<?php

namespace AppBundle;

use Symfony\Component\HttpKernel\Event\FilterControllerEvent;

class ControllerListener
{
	function event(FilterControllerEvent $event)
	{
		$c = $event->getController();
		$controller = $c[0];
		if(method_exists($controller, '_init')) {
			$controller->_init($event->getRequest());
		}
	}
}
