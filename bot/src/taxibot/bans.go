package taxibot

import (
	"staxi/proto"
	"time"
)

func init() {
	addMsgFunc("ban-info", msgBanInfo)
}

func msgBanInfo(bot *Bot, msg *proto.Msg) {
	t := msg.Int("remaining_time")
	if t > 0 {
		bot.Msg("Banned!")
		go checkBan(bot, t)
	} else {
		bot.Msg("Unbanned")
	}
}

func checkBan(bot *Bot, t int) {
	time.Sleep(time.Duration(t) * time.Second)
	bot.Send("get-ban-info", nil)
}
