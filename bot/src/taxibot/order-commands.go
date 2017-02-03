package taxibot

import (
	"math/rand"
	"staxi/proto"
)

func declineOrder(bot *Bot, order_id int, reason string) {
	bot.Msg("Declining order", order_id)
	data := &proto.Dict{
		"order_id": order_id,
		"reason":   reason}
	bot.Send("decline-order", data)
}

func acceptOrder(bot *Bot, order_id int) {
	bot.Msg("Accepting order", order_id)
	bot.Send("accept-order", &proto.Dict{"order_id": order_id,
		"arrival_time_m": (3 + rand.Intn(7))})
}

func cancelOrder(bot *Bot, order_id int, reason string) {
	state := getState(bot)
	state.orderId = 0
	bot.Msg("Cancel order", order_id, ",", reason)
	bot.Send("cancel-order", &proto.Dict{"order_id": order_id,
		"reason": reason})
}

func notify(bot *Bot, order_id int) {
	bot.Send("notify-user", &proto.Dict{"order_id": order_id})
}

func startOrder(bot *Bot, order_id int) {
	bot.Send("order-started", &proto.Dict{"order_id": order_id})
}
