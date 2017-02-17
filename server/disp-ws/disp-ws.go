package main

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"net/http"
)

var database *sql.DB

type funcmap map[string]func(*protoMessage)

func main() {
	var err error

	database, err = sql.Open("mysql", "root:root@tcp(localhost:3306)/racket")
	if err != nil {
		log.Fatal(err)
	}

	// Connect to the main server
	conn, err := serverConnect("localhost:12345")
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Connected to server")

	// Create a map of message handlers and
	// let all the submodules to populate it
	fn := make(funcmap)
	initDispatchers(fn, conn)

	// Start the web server
	go http.ListenAndServe(":8080", nil)

	// Process messages from the main server
	err = serverFunc(conn, fn)
	log.Fatal(err)
}

// Routine that holds the connection to the server
func serverFunc(conn *serverConn, fn funcmap) error {
	var err error
	for {
		msg, err := conn.readMsg()
		if err != nil {
			break
		}
		cmd := msg.command
		f, ok := fn[cmd]
		if !ok {
			log.Println("Unknown message: " + cmd)
			continue
		}
		f(msg)
	}
	return err
}
