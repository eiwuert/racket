package taxibot

import (
	"math/rand"
	"staxi/proto"
)

/*
 * Simulate a full trip or get cancelled by orderGone event.
 */
func processOrder(bot *Bot, order_id int) {
	state := getState(bot)
	/*
	 * Take some time to arrive, then maybe send an "arrived" message.
	 */
	if state.gone.Wait(randDuration(10, 60)) {
		bot.Msg("Oh, crap, I was just arriving")
		return
	}
	bot.Msg("Arrived")
	if Prob(bot.Config.ArriveSignalProb) {
		notify(bot, order_id)
	}

	/*
	 * Wait for the customer. Maybe, cancel the order.
	 */
	if state.gone.Wait(randDuration(0, 60)) {
		bot.Msg("Dude, I was already there!")
		return
	}

	if Prob(bot.Config.BadCustomerProb) {
		if rand.Intn(1) == 1 {
			cancelOrder(bot, order_id, "no_customer")
		} else {
			cancelOrder(bot, order_id, "bad_customer")
		}
		state.orderId = 0
		return
	}

	/*
	 * Start the trip.
	 */
	state.taximeter.Start(bot)
	startOrder(bot, order_id)

	if state.gone.Wait(randDuration(120, 300)) {
		bot.Msg("Hey, are you cancelling the order now?")
		state.taximeter.Stop(bot)
		return
	}

	price := state.taximeter.Stop(bot)

	bot.Send("order-finished", &proto.Dict{"order_id": order_id, "price": price})
	state.orderId = 0
}
