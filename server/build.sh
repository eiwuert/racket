#!/bin/sh
if [ ! -d out/obj ]; then
	mkdir -p out/obj
fi

php phpcat.php lib src > out/obj/taxi.php
