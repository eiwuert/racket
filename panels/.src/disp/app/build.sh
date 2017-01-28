#!/bin/sh

dest=../../../www/res/dispatcher


# build the stylesheet
	cat css/main.css.php css/*.css > tmp.php
	php tmp.php > $dest/order.css
	lessc css/app.less >> $dest/order.css
	rm tmp.php

# build the order script
	gulp
