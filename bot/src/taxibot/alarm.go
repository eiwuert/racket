package taxibot

import (
	"math/rand"
	"time"
)

func init() {
	addInitFunc(func(bot *Bot) {
		//go sendAlarms(bot)
	})
}

func sendAlarms(bot *Bot) {
	for {
		time.Sleep(time.Duration(rand.Intn(60)) * time.Minute)
		bot.Msg("*** Sending alarm ***")
		bot.Send("alarm", nil)
	}
}
