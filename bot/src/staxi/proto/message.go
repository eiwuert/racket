package proto

import (
	"genera/json"
)

type Dict map[string]interface{}

/*
 * Message is a combination of "command", which is the type of the
 * message, and "data", which is a key-value storage with data depending
 * on the message type.
 */
type Msg struct {
	id      string
	re      string
	Ack     int
	Command string
	Data    *json.Obj
}

func NewMsg(cmd string, data interface{}) *Msg {
	m := new(Msg)
	m.Command = cmd
	m.Data = json.Wrap(data)
	return m
}

func (msg *Msg) Int(key string) int {
	return msg.Data.Int(key)
}

func (msg *Msg) Str(key string) string {
	return msg.Data.Str(key)
}

func (msg *Msg) Dbl(key string) float64 {
	return msg.Data.Dbl(key)
}

func (msg *Msg) Long(key string) int64 {
	return msg.Data.Long(key)
}

func (msg *Msg) Arr(key string) []*json.Obj {
	return msg.Data.Arr(key)
}

func (msg *Msg) Obj(key string) *json.Obj {
	return msg.Data.Obj(key)
}

func (msg *Msg) Err() error {
	return msg.Data.Err()
}
