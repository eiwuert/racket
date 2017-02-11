package main

import (
	"encoding/json"
	"errors"
)

type protoMessage struct {
	command string
	data    map[string]interface{}
}

// Parses a string and returns a message object.
func parseProtoMessage(line string) (*protoMessage, error) {
	var msg = new(protoMessage)
	var ok bool

	// Parse the JSON into a raw map
	var data map[string]interface{}
	err := json.Unmarshal([]byte(line), &data)
	if err != nil {
		return nil, err
	}

	// Get the "command" field
	msg.command, ok = data["command"].(string)
	if !ok {
		return nil, errors.New("missing command field")
	}

	// Get the message parameters map
	var pack map[string]interface{}
	pack, ok = data["data"].(map[string]interface{})
	if ok {
		msg.data = pack
	} else {
		msg.data = make(map[string]interface{})
	}
	return msg, nil
}

// Serializes a message
func serializeProtoMessage(msg *protoMessage) ([]byte, error) {
	obj := make(map[string]interface{})
	obj["command"] = msg.command
	obj["data"] = msg.data
	buf, err := json.Marshal(obj)
	if err != nil {
		return buf, err
	}
	buf = append(buf, '\n')
	return buf, nil
}
