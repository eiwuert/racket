package json

/*
 * Cast operations for the object.
 */
import (
	"fmt"
	"strconv"
)

func (o *Obj) traverse(key string) (interface{}, error) {
	if key == "" {
		return o.data, nil
	}

	dict, ok := o.data.(map[string]interface{})
	if !ok {
		o.err = fmt.Errorf("`%s` is not an object", key)
		return nil, o.err
	}

	subdata, ok := dict[key]
	if !ok {
		o.err = fmt.Errorf("no key `%s` in the object", key)
		return nil, o.err
	}

	return subdata, nil
}

func (o *Obj) Arr(key string) []*Obj {
	list := make([]*Obj, 0)

	data, err := o.traverse(key)
	if err != nil {
		return list
	}

	arr, ok := data.([]interface{})
	if !ok {
		o.err = fmt.Errorf("`%s` is not an array (%v)", key, data)
		return list
	}

	for _, data := range(arr) {
		list = append(list, &Obj{data, nil})
	}
	return list
}

func (o *Obj) Obj(key string) *Obj {
	data, err := o.traverse(key)
	if err != nil {
		return &Obj{nil, err}
	}

	return &Obj{data, nil}
}

func (o *Obj) Str(key string) string {
	data, err := o.traverse(key)
	if err != nil {
		return ""
	}

	s, ok := data.(string)
	if !ok {
		o.err = fmt.Errorf("`%s` is not a string (%v)", key, data)
		return ""
	}
	return s
}

func (o *Obj) Dbl(key string) float64 {
	data, err := o.traverse(key)
	if err != nil {
		return 0.0
	}

	f, ok := data.(float64)
	if !ok {
		o.err = fmt.Errorf("`%s` is not a float64 (%v)", key, data)
		return 0.0
	}
	return f
}

func (o *Obj) Int(key string) int {
	data, err := o.traverse(key)
	if err != nil {
		return 0
	}

	f, ok := data.(float64)
	if ok {
		return int(f)
	}

	str, ok := data.(string)
	if !ok {
		o.err = fmt.Errorf("`%s` is not a number (%v)", key, data)
		return 0
	}
	i, err := strconv.Atoi(str)
	if err != nil {
		o.err = fmt.Errorf("`%s` is not a number (%v)", key, data)
		return 0
	}
	return i
}

func (o *Obj) Long(key string) int64 {
	data, err := o.traverse(key)
	if err != nil {
		return 0
	}

	f, ok := data.(float64)
	if ok {
		return int64(f)
	}

	str, ok := data.(string)
	if !ok {
		o.err = fmt.Errorf("`%s` is not a number (%v)", key, data)
		return 0
	}
	i, err := strconv.ParseInt(str, 10, 64)
	if err != nil {
		o.err = fmt.Errorf("`%s` is not a number (%v)", key, data)
		return 0
	}
	return i
}
