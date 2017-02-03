package taxibot

import (
	"genera/json"
	"math/rand"
	"staxi/proto"
	"strings"
	"time"
)

var typing = false

func init() {

	addInitFunc(func(bot *Bot) {
		now := time.Now().UTC().Unix()
		bot.Send("get-chat-messages", &proto.Dict{
			"since": now - 3600,
			"until": now + 10,
		})
		bot.Send("get-chat-phrases", nil)
	})

	addMsgFunc("chat-messages", func(bot *Bot, msg *proto.Msg) {
		arr := msg.Arr("")
		if msg.Err() != nil {
			bot.Err(msg.Err())
			return
		}
		for _, obj := range arr {
			err := showChatMessage(bot, obj)
			if err != nil {
				break
			}
		}
	})

	addMsgFunc("chat-message", func(bot *Bot, msg *proto.Msg) {
		showChatMessage(bot, msg.Data)

		from := msg.Str("from")
		if msg.Err() != nil {
			bot.Err(msg.Err())
			return
		}

		/*
		 * If the message is from a dispatcher and we "feel like"
		 * responding, respond.
		 */
		if strings.HasPrefix(from, "dispatcher:") &&
			rand.Intn(100) < 60 && !typing {
			typing = true
			go respondToMessage(bot)
		}
	})

	addMsgFunc("chat-phrases", func(bot *Bot, msg *proto.Msg) {
		arr := msg.Arr("")
		if msg.Err() != nil {
			bot.Err(msg.Err())
			return
		}

		phrases := make([]string, 0)
		for _, obj := range arr {
			phrase := obj.Str("")
			if obj.Err() != nil {
				bot.Err(obj.Err())
				return
			}
			phrases = append(phrases, phrase)
		}
		go useChat(bot, phrases)
	})
}

func respondToMessage(bot *Bot) {
	responses := []string{
		"Ну чё ты мелешь?",
		"Не мешай работать",
		"Я занят, приставай к Ломову",
		"Отстань, курица!",
		";)",
		"Хорош уже",
		"Чё доколупываешься?",
		"Отстань",
		"Ладно",
	}

	response := responses[rand.Intn(len(responses))]
	time.Sleep(time.Duration(2+len(response)) * time.Second)

	bot.Send("send-chat-message", &proto.Dict{
		"to":   "dispatcher:",
		"text": response,
	})
	typing = false
}

func showChatMessage(bot *Bot, m *json.Obj) error {
	from := m.Str("from")
	text := m.Str("text")
	if m.Err() != nil {
		return m.Err()
	}
	bot.Msg("chat message from", from, ":", text)
	return nil
}

func useChat(bot *Bot, phrases []string) {
	n := len(phrases)
	if n == 0 {
		bot.Msg("No chat phrases")
		return
	}

	for {
		time.Sleep(60 * time.Second)
		bot.Send("send-chat-message", &proto.Dict{
			"text": phrases[rand.Intn(n)],
			"to":   "dispatcher:",
		})
	}
}
