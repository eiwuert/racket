package proto

import (
	"genera/json"
	"time"
)

// Parses a string and returns a message object.
func parseMessage(line string) (*Msg, error) {

	obj, err := json.Parse([]byte(line))
	if err != nil {
		return nil, err
	}

	cmd := obj.Str("command")
	data := obj.Obj("data")
	if err = obj.Err(); err != nil {
		return nil, err
	}
	ack := obj.Int("ack")

	var msg Msg
	msg.Command = cmd
	msg.Data = data
	msg.Ack = ack
	return &msg, nil
}

func writeMessage(msg *Msg) ([]byte, error) {
	data := map[string]interface{}{"command": msg.Command,
		"timestamp": time.Now().UTC().UnixNano() / 1e6,
	}
	obj := json.Wrap(data)
	err := obj.Attach("data", msg.Data)
	if err != nil {
		return nil, err
	}

	str, err := obj.JSON()
	if err != nil {
		return nil, err
	}
	buf := append([]byte(str), '\n')
	return buf, nil
}
