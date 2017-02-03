package taxibot

import (
	"staxi/proto"
)

func init() {
	addMsgFunc("message", msgMessage)
}

func msgMessage(bot *Bot, msg *proto.Msg) {
	bot.Msg("Message:", msg.Str("text"))
}
