package proto

import (
	"fmt"
	"io"
	"math"
	"sync"
)

type Reception struct {
	inbox           chan *Msg
	outbox          chan *Msg
	requestChannels map[string]chan *Msg
	counter         uint32
	mutex           sync.Mutex
}

/*
 * Create an instance.
 */
func NewReception() *Reception {
	r := new(Reception)
	r.inbox = make(chan *Msg, 10)
	r.outbox = make(chan *Msg, 10)
	r.requestChannels = make(map[string]chan *Msg)
	return r
}

/*
 * Send a message to the underlying connection.
 */
func (r *Reception) Send(msg *Msg) {
	msg.id = r.nextMessageId()
	r.outbox <- msg
}

/*
 * Receive a message.
 */
func (r *Reception) Receive() *Msg {
	return <-r.inbox
}

/*
 * Send a marked message, wait for targetted reply and return
 * the reply.
 */
func (r *Reception) Request(msg *Msg) *Msg {
	id := r.nextMessageId()
	ch := make(chan *Msg, 1)
	r.requestChannels[id] = ch
	r.outbox <- msg
	response := <-ch
	delete(r.requestChannels, id)
	return response
}

/*
 * Reply to message "to" with message "with".
 */
func (r *Reception) Reply(to *Msg, with *Msg) {
	with.re = to.id
	r.Send(with)
}

/*
 * Process the connection.
 */
func (r *Reception) Work(rw *ReadWriter) error {
	var err error
	var msg *Msg

	in := make(chan *Msg, 1)
	go receiveMessages(rw, in)

	for {
		select {
		case msg = <-r.outbox:
			err = rw.WriteMsg(msg)
			if err != nil {
				return err
			}
		case msg = <-in:
			if msg == nil {
				return io.EOF
			}
			r.putMessage(msg)
		}
	}
}

func receiveMessages(rw *ReadWriter, ch chan *Msg) {
	for {
		msg, err := rw.Read()
		if err == io.EOF {
			close(ch)
			return
		}
		if err != nil {
			continue
		}
		ch <- msg
	}
}

func (r *Reception) putMessage(msg *Msg) {
	id := msg.re
	ch, ok := r.requestChannels[id]
	if !ok {
		ch = r.inbox
	}
	ch <- msg
}

func (r *Reception) nextMessageId() string {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	if r.counter == math.MaxUint32 {
		r.counter = 1
	} else {
		r.counter++
	}
	return fmt.Sprintf("%d", r.counter)
}
