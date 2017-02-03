package json

import (
	"encoding/json"
	"errors"
)

type Obj struct {
	data interface{}
	err  error
}

func (o *Obj) Err() error {
	return o.err
}

/*
 * Parses the given string and returns a JSON node.
 */
func Parse(buf []byte) (*Obj, error) {
	var data interface{}
	err := json.Unmarshal(buf, &data)
	return &Obj{data, err}, nil
}

func Wrap(data interface{}) *Obj {
	return &Obj{data, nil}
}

func (o *Obj) Attach(key string, add *Obj) error {
	m, ok := o.data.(map[string]interface{})
	if !ok {
		return errors.New("Not an object")
	}
	m[key] = add.data
	return nil
}

func (o *Obj) JSON() (string, error) {
	data, err := json.Marshal(o.data)
	return string(data), err
}
