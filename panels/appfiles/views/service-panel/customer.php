<?php _header(); ?>

<?php
$customer_id = argv(1);
$customer = new customer( $customer_id, '*' );
?>

<h1><?= $customer->phone() ?></h1>

<form method="post" action="<?= aurl( 'save_service_customer' ) ?>">
	<input name="customer_id" value="<?= $customer_id ?>" type="hidden">
	<div>
		<label>Имя</label>
		<input name="name" value="<?= $customer->name() ?>">
	</div>
	<div>
		<label>Телефон</label>
		<input type="tel" name="phone" value="<?= $customer->phone() ?>">
	</div>
	<div>
		<label>День рождения</label>
		<input type="date" name="birth_date" value="<?= $customer->birth_date() ?>">
	</div>
	<div>
		<input type="checkbox" id="cb-blacklist" name="blacklist"
			value="1"<?= $customer->blacklist()? ' checked' : '' ?>>
		<label for="cb-blacklist">Чёрный список</label>
	</div>
	<div>
		<label>Комментарии</label>
		<textarea name="comments"><?= $customer->comments() ?></textarea>
	</div>
	<button type="submit">Сохранить</button>
</form>

<?php _footer(); ?>
