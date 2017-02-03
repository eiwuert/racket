package taxibot

import (
	"genera/excuse"
	"math/rand"
	"staxi/proto"
	"time"
)

func init() {
	addInitFunc(initChat)
	addMsgFunc("road-message", msgRoadMessage)
	addMsgFunc("road-messages", msgRoadMessages)
}

func initChat(bot *Bot) {
	bot.Send("get-road-messages", nil)
	//go chat(bot)
}

func chat(bot *Bot) {
	for {
		time.Sleep(time.Duration(500+rand.Intn(100)) * time.Second)
		bot.Send("road-message", &proto.Dict{"text": randomText()})
	}
}

func randomText() string {
	s, _ := excuse.Get()
	return s
}

func msgRoadMessage(bot *Bot, msg *proto.Msg) {
	text := msg.Str("text")
	author := msg.Str("author")
	if msg.Err() != nil {
		bot.Err(msg.Err())
		return
	}
	//time := msg.Data["timestamp"]
	bot.Msg(author, "says: ", text)
}

func msgRoadMessages(bot *Bot, msg *proto.Msg) {
	arr := msg.Arr("list")
	if msg.Err() != nil {
		bot.Err(msg.Err())
		return
	}

	for _, obj := range arr {
		author := obj.Str("author")
		text := obj.Str("text")
		if obj.Err() != nil {
			bot.Err(obj.Err())
			return
		}
		bot.Msg(author, "says", text)
	}
	bot.Msg("--end")
}
