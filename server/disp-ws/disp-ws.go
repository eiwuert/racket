package main

import (
	"bufio"
	"database/sql"
	"errors"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/websocket"
	"log"
	"net"
	"net/http"
	"time"
)

// The message that the routines will pass to each other.
// This is just the uninterpreted application payload with
// dispatcher identifier attached.
type message struct {
	// Dispatcher's identifier. Denotes either the message's
	// author or recipient depending on which way the message
	// goes.
	dispatcherId int

	// Opaque payload
	data string
}

var database *sql.DB

func main() {
	var err error

	database, err = sql.Open("mysql", "root:root@tcp(localhost:3306)/ontax")
	if err != nil {
		log.Fatal(err)
	}

	sw := newSwitch()
	serverPipe := make(chan *message, 1)
	errchan := make(chan error, 1)

	go serverRoutine(serverPipe, sw, errchan)
	go dispatchersRoutine(serverPipe, sw, errchan)

	err = <-errchan
	log.Fatal(err)
}

// Routine that holds the connection to the server
func serverRoutine(fromDispatchers chan *message, sw *dispatchersSwitch, errchan chan error) {
	conn, err := serverConnect("localhost:12345")
	if err != nil {
		errchan <- err
		return
	}
	log.Println("Connected to server")

	// Create a channel from the connection so that we can
	// use it in select
	fromServer := channelize(conn)
	more := true
	for more {
		var msg *message
		select {
		// Pass messages from the pipe to the server
		case msg = <-fromDispatchers:
			passToServer(conn, msg)

		// Pass messages from the server to dispatchers
		case msg, more = <-fromServer:
			if !more {
				break
			}
			if msg.dispatcherId != 0 {
				sw.send(msg.dispatcherId, msg.data)
			} else {
				sw.broadcast(msg.data)
			}
		}
	}
	errchan <- errors.New("Lost connection to the server")
}

func channelize(c *serverConn) chan *message {
	ch := make(chan *message, 1)
	go func() {

		var err error
		for {
			protoMsg, err := c.readMsg()
			if err != nil {
				break
			}

			dispId := int(protoMsg.data["dispatcher_id"].(float64))
			command := protoMsg.data["cmd"].(string)
			data := protoMsg.data["data"].(map[string]interface{})

			// Make the dispatcher's message
			protoMsg = &protoMessage{command, data}

			// Pass it to channel
			bytes, err := serializeProtoMessage(protoMsg)
			if err != nil {
				break
			}
			msg := &message{dispId, string(bytes)}
			ch <- msg
		}
		log.Println(err)
		close(ch)
	}()
	return ch
}

func passToServer(conn *serverConn, msg *message) error {
	// msg.data contains a serialized protocol-level message
	// from a dispatcher client. We have to parse that message,
	// put it into another protocol-level message, serialize the
	// result and send it to the server.

	// The server expects "cmd" messages with parameters "cmd",
	// "disp_id" and "data".

	protomsg, err := parseProtoMessage(msg.data)
	if err != nil {
		return err
	}

	wrap := new(protoMessage)
	wrap.command = "cmd"
	wrap.data = make(map[string]interface{})
	wrap.data["disp_id"] = msg.dispatcherId
	wrap.data["data"] = protomsg.data
	wrap.data["command"] = protomsg.command

	return conn.sendMsg(wrap)
}

type serverConn struct {
	conn   net.Conn
	reader *bufio.Reader
}

func serverConnect(addr string) (*serverConn, error) {
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		return nil, err
	}
	c := &serverConn{conn, bufio.NewReader(conn)}

	// Authorize
	authMsg := &protoMessage{"auth-dispatcher", map[string]interface{}{}}
	c.sendMsg(authMsg)
	c.readMsg()

	// Ping the server to keep activity
	go func() {
		ping := &protoMessage{"ping", map[string]interface{}{}}
		err = nil
		for err == nil {
			time.Sleep(20 * time.Second)
			err = c.sendMsg(ping)
		}
	}()

	return c, nil
}

func (c *serverConn) sendMsg(msg *protoMessage) error {
	bytes, err := serializeProtoMessage(msg)
	if err != nil {
		return err
	}
	_, err = c.conn.Write(bytes)
	return err
}

func (c *serverConn) readMsg() (*protoMessage, error) {
	bytes, err := c.reader.ReadBytes('\n')
	if err != nil {
		return nil, err
	}

	msg, err := parseProtoMessage(string(bytes))
	if err != nil {
		return nil, err
	}
	return msg, err
}

// Routine that holds the web connection
func dispatchersRoutine(serverPipe chan *message, dispSwitch *dispatchersSwitch, errchan chan error) {

	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	// The handler for all incoming connections
	http.HandleFunc("/conn", func(w http.ResponseWriter, request *http.Request) {

		log.Println("New connection")

		// Check the token
		token := request.URL.Query().Get("token")
		dispId, err := checkToken(token)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		// Upgrade the connection to websocket protocol
		ws, err := upgrader.Upgrade(w, request, nil)
		if err != nil {
			log.Println(err)
			return
		}

		// Create two channels for this websocket and start passing data
		fromServer := make(chan string, 1)
		dispSwitch.add(dispId, fromServer)
		processDispatcher(ws, dispId, fromServer, serverPipe)
		dispSwitch.remove(dispId)
	})

	errchan <- http.ListenAndServe(":8080", nil)
}

func checkToken(token string) (int, error) {
	dispId := 0
	err := database.QueryRow(`
		SELECT acc_id FROM taxi_accounts
		WHERE type = 'dispatcher' AND token = ?`, token).Scan(&dispId)
	return dispId, err
}

func processDispatcher(ws *websocket.Conn, dispId int, fromServer chan string, toServer chan *message) error {
	errchan := make(chan error, 1)

	// Pass messages from websocket to server's pipe
	go func() {
		for {
			ws.SetReadDeadline(time.Now().Add(time.Minute))
			_, data, err := ws.ReadMessage()
			if err != nil {
				errchan <- err
				break
			}
			toServer <- &message{dispId, string(data)}
		}
	}()

	// Pass messages from server to websocket
	for {
		select {
		case data := <-fromServer:
			ws.SetWriteDeadline(time.Now().Add(time.Minute))
			err := ws.WriteMessage(websocket.TextMessage, []byte(data))
			if err != nil {

			}
		case err := <-errchan:
			return err
		}
	}

	return nil
}
