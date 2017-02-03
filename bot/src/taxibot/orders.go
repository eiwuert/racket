package taxibot

import (
	"genera/json"
	"log"
	"math/rand"
	"staxi/proto"
	"sync"
	"time"
)

type state struct {
	orderId   int
	reqId     string
	gone      Event
	lock      sync.Mutex
	taximeter taximeter
}

func init() {
	addInitFunc(initOrders)
	addMsgFunc("new-order", msgNewOrder)
	addMsgFunc("order-dropped", msgOrderDropped)
	addMsgFunc("order-accepted", msgOrderAccepted)
	addMsgFunc("order-gone", msgOrderGone)
	addMsgFunc("order-created", msgOrderCreated)
	addMsgFunc("order-failed", msgOrderFailed)
	addMsgFunc("current-orders", msgCurrentOrders)
}

func initOrders(bot *Bot) {
	var ordersState state
	bot.Data["orders_state"] = &ordersState
	bot.Msg("freq = ", bot.Config.CustomOrdersFreq)
	if bot.Config.CustomOrdersFreq > 0 {
		go createOwnOrders(bot)
	}
}

func getState(bot *Bot) *state {
	return bot.Data["orders_state"].(*state)
}

func createOwnOrders(bot *Bot) {
	state := getState(bot)
	for {
		FreqWait(bot.Config.CustomOrdersFreq)

		// If have order, skip
		if state.orderId != 0 {
			continue
		}

		bot.Msg("creating custom order")
		reqId := "42"
		state.reqId = reqId
		bot.Send("create-order", &proto.Dict{"req_id": reqId, "started": "0"})

		// if after 10 seconds no response, clean
		time.Sleep(10 * time.Second)
		if state.reqId == reqId {
			bot.Msg("No response for create-order")
			state.reqId = ""
		}
	}
}

func msgOrderCreated(bot *Bot, msg *proto.Msg) {
	reqId := msg.Str("req_id")
	order := msg.Obj("order")
	if msg.Err() != nil {
		bot.Err(msg.Err())
		return
	}

	orderId := order.Int("order_id")
	if order.Err() != nil {
		bot.Err(order.Err())
		return
	}

	state := getState(bot)

	// If request id doesn't match, kick the order
	if reqId != state.reqId {
		bot.Msg("Unknown req_id")
		cancelOrder(bot, orderId, "Unknown req_id")
		return
	}
	state.reqId = ""

	// If have another order already, kick this one.
	state.lock.Lock()
	defer state.lock.Unlock()
	if state.orderId != 0 {
		bot.Msg("Order created, but already have one")
		cancelOrder(bot, orderId, "busy")
		return
	}

	state.orderId = orderId
	bot.Msg("Order created")
	go processOrder(bot, orderId)
}

func msgOrderFailed(bot *Bot, msg *proto.Msg) {
	reqId := msg.Str("req_id")
	reason := msg.Str("reason")
	if msg.Err() != nil {
		bot.Err(msg.Err())
		return
	}
	state := getState(bot)

	if reqId != state.reqId {
		bot.Msg("Unknown req_id")
		return
	}
	state.reqId = ""
	bot.Msg("Could not create order: " + reason)
}

/*
 * message: "new-order".
 */
func msgNewOrder(bot *Bot, msg *proto.Msg) {
	order_id := msg.Int("order_id")
	bot.Log("Received new order (%d)", order_id)
	printOrder(bot, msg.Data)
	/*
	 * If we have an order already, decline the new one.
	 */
	state := getState(bot)
	if state.orderId != 0 {
		log.Println("Already have an order")
		declineOrder(bot, order_id, "full")
		return
	}

	go takeNewOrder(bot, order_id)
}

func printOrder(bot *Bot, order *json.Obj) {
	bot.Log("------------")
	bot.Log("* order id: %d", order.Int("order_id"))
	bot.Log("* coords: (%.7f, %.7f)", order.Dbl("latitude"), order.Dbl("longitude"))
	bot.Log("* distance: %d m", order.Int("distance"))
	bot.Log("* importance: %d", order.Int("importance"))
	bot.Log("* from: %s", order.Str("from_address"))
	bot.Log("* to: %s", order.Str("to_address"))
	bot.Log("* comments: %s", order.Str("comments"))
	bot.Log("* car type: %s", order.Str("car_type"))
	bot.Log("* customer: %s (%s)", order.Str("customer_phone"), order.Str("customer_name"))
	bot.Log("------------")
}

func takeNewOrder(bot *Bot, orderId int) {
	/*
	 * Think a few seconds
	 */
	state := getState(bot)
	if state.gone.Wait(randDuration(1, 5)) {
		bot.Msg("Order gone?")
		return
	}

	if Prob(bot.Config.DeclineProb) {
		declineOrder(bot, orderId, "driver")
	} else {
		acceptOrder(bot, orderId)
	}
}

/*
 * Order one may come after we have tried to accept it.
 */
func msgOrderGone(bot *Bot, msg *proto.Msg) {
	state := getState(bot)
	state.lock.Lock()
	defer state.lock.Unlock()
	if msg.Int("order_id") != state.orderId {
		bot.Msg("Unknown order gone")
		return
	}
	bot.Msg("Order gone")
	/*
	 * Notify all dependent goroutines when an order is dropped
	 * unexpectedly, and clean the order.
	 */
	state.gone.Broadcast()
	state.orderId = 0
}

func msgOrderDropped(bot *Bot, msg *proto.Msg) {
	state := getState(bot)
	state.lock.Lock()
	defer state.lock.Unlock()
	if msg.Int("order_id") != state.orderId {
		bot.Msg("Unknown order dropped")
		return
	}
	bot.Msg("Order dropped")
	/*
	 * Notify all dependent goroutines when an order is dropped
	 * unexpectedly, and clean the order.
	 */
	state.gone.Broadcast()
	state.orderId = 0
}

/*
 * If we accept the order successfully, an "order-accepted" message
 * will come in.
 */
func msgOrderAccepted(bot *Bot, msg *proto.Msg) {
	order_id := msg.Int("order_id")

	state := getState(bot)
	state.lock.Lock()
	defer state.lock.Unlock()
	if state.orderId != 0 {
		bot.Msg("Received order-accepted, but have an order")
		return
	}
	state.orderId = order_id

	/*
		if postponed and dice {
			time.Sleep(3 * time.Second)
			cancelOrder(bot, order_id, "returning")
			return
		}
	*/
	go processOrder(bot, order_id)
}

func msgCurrentOrders(bot *Bot, msg *proto.Msg) {
	list := msg.Arr("list")
	if msg.Err() != nil {
		bot.Err(msg.Err())
		return
	}

	for _, order := range list {
		id := order.Int("order_id")
		if order.Err() != nil {
			bot.Err(order.Err())
			return
		}
		bot.Msg("Order id:", id)
		cancelOrder(bot, int(id), "cleaning")
	}
}

func randDuration(minSeconds, maxSeconds int) time.Duration {
	n := rand.Intn(maxSeconds-minSeconds) + minSeconds
	return time.Duration(n) * time.Second
}
