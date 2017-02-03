package taxibot

import (
	"fmt"
	"geo"
	"staxi/proto"
)

type Bot struct {
	Config     Config
	conn       *proto.ReadWriter
	Data       map[string]interface{}
	Speed      float64
	Odometer   int
	Coords     geo.Point
	Neighbours map[int]*driverInfo
}

func New() *Bot {
	bot := new(Bot)
	bot.Data = make(map[string]interface{})
	bot.Neighbours = make(map[int]*driverInfo)
	return bot
}

func (b *Bot) Msg(args ...interface{}) {
	fmt.Print(b.Config.Login + ": ")
	fmt.Println(args...)
}

func (b *Bot) Err(err error) {
	b.Msg("** error:", err)
	panic("bot error")
}

func (b *Bot) Log(format string, args ...interface{}) {
	fmt.Print(b.Config.Login + ": ")
	fmt.Printf(format, args...)
	fmt.Print("\n")
}

func (bot *Bot) Send(cmd string, data interface{}) {
	err := bot.conn.Write(cmd, data)
	if err != nil {
		bot.Msg(err)
	}
}
