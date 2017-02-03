package taxibot

import (
	"math/rand"
	"staxi/proto"
	"time"
)

func init() {
	addMsgFunc("session-status", func(bot *Bot, msg *proto.Msg) {
		if msg.Int("open") == 1 {
			bot.Msg("Session is open")
			//go closeSessionLater(bot)
		} else {
			bot.Msg("No session")
			go openSessionLater(bot)
		}
	})
	addMsgFunc("session-opened", func(bot *Bot, msg *proto.Msg) {
		bot.Msg("Session opened")
		go closeSessionLater(bot)
	})
	addMsgFunc("session-closed", func(bot *Bot, msg *proto.Msg) {
		bot.Msg("Session closed")
		go openSessionLater(bot)
	})
}

/*
 * These two functions are not suited for case of spurious session
 * openings and closings.
 */
func closeSessionLater(bot *Bot) {
	time.Sleep(time.Duration(rand.Intn(8)+1) * time.Hour)
	bot.Msg("Sending request to close the session")
	bot.Send("close-session", &proto.Dict{"odometer": bot.Odometer})
}

func openSessionLater(bot *Bot) {
	time.Sleep(time.Duration(rand.Intn(10)) * time.Second)
	bot.Msg("Sending request to open a session")
	bot.Send("open-session", &proto.Dict{"odometer": bot.Odometer})
}
