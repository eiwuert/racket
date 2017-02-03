package taxibot

import (
	"staxi/proto"
	"time"
)

func init() {
	addInitFunc(func(bot *Bot) {
		bot.Data["RTT"] = 0
		go ping(bot)
	})

	addMsgFunc("pong", msgPong)
}

func ping(bot *Bot) {
	for {
		time.Sleep(10 * time.Second)
		ms := timems()
		bot.Send("ping", &proto.Dict{"time": ms, "lag": bot.Data["RTT"].(int)})
	}
}

// Processes "pong" messages.
func msgPong(bot *Bot, msg *proto.Msg) {
	t1 := timems()
	t0 := msg.Int("time")
	rtt := t1 - t0
	bot.Data["RTT"] = rtt
}

// Returns current time in milliseconds.
func timems() int {
	return int(time.Now().UTC().UnixNano() / 1000000)
}
