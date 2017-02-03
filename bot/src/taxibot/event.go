package taxibot

/*
 * This implements a condition variable on which many goroutines can
 * wait and be woken either by a timeout or a signal.
 */

import (
	"sync"
	"time"
)

type Event struct {
	mutex     sync.Mutex
	listeners int
	sig       chan bool
}

func (w *Event) inc() {
	w.mutex.Lock()
	w.listeners++
	w.mutex.Unlock()
}

func (w *Event) dec() {
	w.mutex.Lock()
	w.listeners--
	w.mutex.Unlock()
}

/*
 * Wait for the event for given timeout. Returns true if the event
 * was broadcast.
 */
func (w *Event) Wait(timeout time.Duration) bool {

	w.inc()
	defer w.dec()

	select {
	case <-time.After(timeout):
		return false
	case <-w.sig:
		return true
	}
}

/*
 * Broadcast the event waking all waiting goroutines.
 */
func (w *Event) Broadcast() {
	w.mutex.Lock()

	for i := 0; i < w.listeners; i++ {
		w.sig <- true
	}

	w.mutex.Unlock()
}
