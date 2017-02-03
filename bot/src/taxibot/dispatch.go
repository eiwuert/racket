/*
 * Init and message functions registers.
 */

package taxibot

import (
	"errors"
	"staxi/proto"
)

/*
 * Functions to be called for each instance after logging in to the
 * server.
 */
type initFunc func(*Bot)

var initFunctions = make([]initFunc, 0)

/*
 * Functions to be called to process messages.
 */
type msgFunc func(*Bot, *proto.Msg)

var messageFunctions = make(map[string]msgFunc, 0)

func addInitFunc(f initFunc) {
	initFunctions = append(initFunctions, f)
}

func addMsgFunc(cmd string, f msgFunc) {
	messageFunctions[cmd] = f
}

func callInit(bot *Bot) {
	for _, f := range initFunctions {
		f(bot)
	}
}

func processMessage(bot *Bot, msg *proto.Msg) error {
	f, ok := messageFunctions[msg.Command]
	if !ok {
		return errors.New("Unknown message: " + msg.Command)
	}
	f(bot, msg)
	return nil
}
