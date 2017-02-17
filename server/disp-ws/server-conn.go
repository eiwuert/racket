package main

import (
	"bufio"
	"net"
	"time"
)

type serverConn struct {
	conn   net.Conn
	reader *bufio.Reader
}

// Connects to the main server and returns a connection handle
func serverConnect(addr string) (*serverConn, error) {
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		return nil, err
	}
	c := &serverConn{conn, bufio.NewReader(conn)}

	// Authorize
	authMsg := &protoMessage{"auth-s2", map[string]interface{}{}}
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
