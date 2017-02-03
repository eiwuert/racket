package taxibot

import (
	"staxi/proto"
	"time"
)

func init() {
	addInitFunc(initGPS)
}

func initGPS(bot *Bot) {
	go sendPosition(bot)
}

func sendPosition(bot *Bot) {
	for {
		time.Sleep(10 * time.Second)
		bot.Send("position", &proto.Dict{
			"latitude":  bot.Coords[0],
			"longitude": bot.Coords[1],
			"time":      time.Now().UTC().Unix(),
		})
	}
}
