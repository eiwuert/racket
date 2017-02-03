package proto

import (
	"bufio"
	"io"
)

type ReadWriter struct {
	out io.Writer
	buf *bufio.Reader
}

func NewReadWriter(in io.Reader, out io.Writer) *ReadWriter {
	r := new(ReadWriter)
	r.buf = bufio.NewReader(in)
	r.out = out
	return r
}

func (r *ReadWriter) Read() (*Msg, error) {
	line, err := r.buf.ReadString('\n')
	if err != nil {
		return nil, err
	}

	msg, err := parseMessage(line)
	if err != nil {
		return nil, err
	}

	return msg, err
}

func (t *ReadWriter) Write(cmd string, data interface{}) error {
	msg := NewMsg(cmd, data)
	return t.WriteMsg(msg)
}

func (t *ReadWriter) WriteMsg(msg *Msg) error {
	line, err := writeMessage(msg)
	if err != nil {
		return err
	}
	_, err = t.out.Write(line)
	return err
}
