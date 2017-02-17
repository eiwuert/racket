package main

import (
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"time"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func initDispatchers(fn funcmap, conn *serverConn) {

	// Map of dispatcher connections
	sw := newSwitch()

	// Forward messages from the main server to websockets
	fn["dispatcher-send"] = func(protoMsg *protoMessage) {
		// Unpack the message
		dispId := int(protoMsg.data["dispatcher_id"].(float64))
		command := protoMsg.data["cmd"].(string)
		data := protoMsg.data["data"].(map[string]interface{})
		pass := &protoMessage{command, data}

		// dispatcher identifier will be zero most of the time,
		// meaning "broadcast". When it's not zero, the message
		// has to bent sent only to the corresponding dispatcher.

		// Send to the websockets
		sw.pass(dispId, pass)
	}

	// Accept websocket connections and pass messages from
	// websockets to main server
	http.HandleFunc("/conn", func(w http.ResponseWriter, request *http.Request) {
		log.Println("New connection")

		// Check the token
		token := request.URL.Query().Get("token")
		dispId, err := checkToken(token)
		if err != nil {
			log.Println(err)
			http.Error(w, "Oops", http.StatusInternalServerError)
			return
		}

		if dispId == 0 {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Upgrade the connection to websocket protocol
		ws, err := upgrader.Upgrade(w, request, nil)
		if err != nil {
			log.Println(err)
			return
		}

		sw.add(dispId, ws)
		for {
			ws.SetReadDeadline(time.Now().Add(time.Minute))
			_, data, err := ws.ReadMessage()
			if err != nil {
				log.Println(err)
				break
			}
			passToServer(data, conn, dispId)
		}
		sw.remove(dispId, ws)
	})
}

func passToServer(data []byte, conn *serverConn, dispId int) error {
	// data contains a serialized protocol-level message
	// from a dispatcher client. We have to parse that message,
	// put it into another protocol-level message, serialize the
	// result and send it to the server.

	// The server expects "dispatcher-cmd" messages with parameters
	// "command", "disp_id" and "data".

	protoMsg, err := parseProtoMessage(string(data))
	if err != nil {
		return err
	}

	wrap := new(protoMessage)
	wrap.command = "dispatcher-cmd"
	wrap.data = make(map[string]interface{})
	wrap.data["disp_id"] = dispId
	wrap.data["data"] = protoMsg.data
	wrap.data["command"] = protoMsg.command
	return conn.sendMsg(wrap)
}

func checkToken(token string) (int, error) {
	dispId := 0
	n := 0
	rows, err := database.Query(`
		SELECT acc_id FROM taxi_accounts
		WHERE type = 'dispatcher' AND token = ?`, token)
	if err != nil {
		return 0, err
	}
	for rows.Next() {
		n++
		err = rows.Scan(&dispId)
		if err != nil {
			break
		}
	}
	return dispId, err
}
