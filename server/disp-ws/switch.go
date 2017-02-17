package main

import (
	"errors"
	"github.com/gorilla/websocket"
	"sync"
	"time"
)

// All routines processing the websockets will create an input channel
// and put it in a shared map so that the server's routine would be
// able to forward the messages to them.
type dispatchersSwitch struct {
	sync.Mutex
	data map[int]*websocket.Conn
}

// Creates a switch
func newSwitch() *dispatchersSwitch {
	sw := new(dispatchersSwitch)
	sw.data = make(map[int]*websocket.Conn)
	return sw
}

// Adds a dispatcher's channel to the switch
func (m *dispatchersSwitch) add(dispId int, conn *websocket.Conn) error {
	m.Lock()
	defer m.Unlock()
	_, exists := m.data[dispId]
	if exists {
		return errors.New("Channel for dispatcher already set")
	}
	m.data[dispId] = conn
	return nil
}

// Removes a channel from the switch
func (m *dispatchersSwitch) remove(dispId int, conn *websocket.Conn) error {
	m.Lock()
	defer m.Unlock()
	c, exists := m.data[dispId]
	if !exists {
		return errors.New("Remove: no channel for the dispatcher")
	}
	if c != conn {
		return errors.New("Remove: wrong websocket")
	}
	delete(m.data, dispId)
	return nil
}

func (sw *dispatchersSwitch) getSocketsList(dispId int) []*websocket.Conn {
	sw.Lock()
	defer sw.Unlock()

	list := make([]*websocket.Conn, 0)
	if dispId == 0 {
		for _, sock := range sw.data {
			list = append(list, sock)
		}
		return list
	}

	sock, exists := sw.data[dispId]
	if exists {
		list = append(list, sock)
	}
	return list
}

func (sw *dispatchersSwitch) pass(dispId int, protoMsg *protoMessage) error {

	var err error
	var data []byte

	data, err = serializeProtoMessage(protoMsg)
	if err != nil {
		return err
	}

	// To avoid locking the whole structure while we are sending
	// something to someone, make a slice of one or all the websockets
	// and then work on it.

	list := sw.getSocketsList(dispId)
	for _, sock := range list {

		sock.SetWriteDeadline(time.Now().Add(time.Minute))
		thisErr := sock.WriteMessage(websocket.TextMessage, data)

		// Remember first occured error
		if thisErr != nil && err == nil {
			err = thisErr
		}
	}
	return err
}
