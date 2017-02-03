package taxibot

import (
	"errors"
	"net"
	"staxi/proto"
	"time"
)

func Run(config Config) error {
	var err error
	/*
	 * Create the bot.
	 */
	bot := New()
	bot.Config = config

	// Connect to the server
	var conn net.Conn
	for i := 0; i < 3; i++ {
		conn, err = connect(bot, config.ServerAddr)
		if err == nil {
			break
		}
		time.Sleep(3 * time.Second)
	}
	if err != nil {
		return err
	}
	defer conn.Close()
	bot.Msg("connected")
	bot.conn = proto.NewReadWriter(conn, conn)

	// Authorise
	err = login(bot, config.Login, config.Password)
	if err != nil {
		return err
	}
	bot.Msg("logged in")

	callInit(bot)
	processMessages(bot)
	return nil
}

func connect(bot *Bot, addr string) (net.Conn, error) {
	const attempts = 3
	var err error
	var conn net.Conn
	/*
	 * Make several attempts to connect to the server.
	 */
	for i := 0; i < attempts; i++ {
		conn, err = net.Dial("tcp", addr)
		if err == nil {
			break
		}

		// Wait before the next attempt
		if i < attempts-1 {
			time.Sleep(time.Second)
		}
	}
	return conn, err
}

func login(bot *Bot, login, pass string) error {
	/*
	 * Authorise. The first response must be a "login-ok".
	 */
	data := proto.Dict{"login": login,
		"password": pass, "relogin": 0, "version": "bot-2"}
	bot.Send("taxi-login", &data)
	msg, err := bot.conn.Read()
	if err != nil {
		return err
	}

	if msg.Command != "login-ok" {
		return errors.New("Expected login-ok, got " + msg.Command)
	}

	return nil
}

func processMessages(bot *Bot) {
	for {
		m, err := bot.conn.Read()
		if err != nil {
			bot.Msg(err)
			break
		}
		/*
		 * If the message requires an acknowledgemnt, send it.
		 */
		if m.Ack > 0 {
			bot.Send("ack", m.Ack)
		}
		err = processMessage(bot, m)
		if err != nil {
			bot.Msg(err)
		}
	}
}
