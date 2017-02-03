dest=../www/res/dispatcher

styles:
	cat css/main.css.php css/*.css > tmp.php
	php tmp.php > $(dest)/order.css
	lessc css/app.less >> $(dest)/order.css
	rm tmp.php
