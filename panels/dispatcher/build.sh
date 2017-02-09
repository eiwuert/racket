#!/bin/sh

dest=../www/res/dispatcher


# build the stylesheet
	lessc style.less >> $dest/order.css

# build the order script
	gulp
