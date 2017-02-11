package main

import (
	"errors"
	"sync"
)

// All routines processing the websockets will create an input channel
// and put it in a shared map so that the server's routine would be
// able to forward the messages to them.
type dispatchersSwitch struct {
	sync.Mutex
	data map[int]chan string
}

// Creates a switch
func newSwitch() *dispatchersSwitch {
	sw := new(dispatchersSwitch)
	sw.data = make(map[int]chan string)
	return sw
}

// Adds a dispatcher's channel to the switch
func (m *dispatchersSwitch) add(dispId int, ch chan string) error {
	m.Lock()
	defer m.Unlock()

	_, exists := m.data[dispId]
	if exists {
		return errors.New("Channel for dispatcher already set")
	}

	m.data[dispId] = ch
	return nil
}

// Removes a channel from the switch
func (m *dispatchersSwitch) remove(dispId int) error {
	m.Lock()
	defer m.Unlock()

	_, exists := m.data[dispId]
	if !exists {
		return errors.New("Remove: no channel for the dispatcher")
	}

	delete(m.data, dispId)
	return nil
}

// Sends data to a dispatcher's channel if it's present
func (m *dispatchersSwitch) send(dispId int, data string) {
	m.Lock()
	defer m.Unlock()

	ch, exists := m.data[dispId]
	if !exists {
		return
	}
	ch <- data
}

// Sends data to all present channels
func (m *dispatchersSwitch) broadcast(data string) {
	m.Lock()
	defer m.Unlock()
	for _, ch := range m.data {
		ch <- data
	}
}
