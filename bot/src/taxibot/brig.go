package taxibot

import (
	"fmt"
	"geo"
	"math"
	"staxi/proto"
	"time"
)

type driverInfo struct {
	callId string
	coords [2]float64
}

var invalidCoords = [2]float64{0.0, 0.0}

func init() {
	addMsgFunc("driver-positions", func(bot *Bot, msg *proto.Msg) {
		/*
		 * Fill the drivers map.
		 */
		list := msg.Arr("")
		if msg.Err() != nil {
			bot.Err(msg.Err())
			return
		}

		for _, info := range list {
			callId := info.Str("call_id")
			lat := info.Dbl("latitude")
			lon := info.Dbl("longitude")
			id := info.Int("id")
			if err := info.Err(); err != nil {
				bot.Err(err)
				break
			}
			bot.Neighbours[id] = &driverInfo{callId, [2]float64{lat, lon}}
		}
		/*
		 * Redraw the map.
		 */
		drawBrigade(bot)
		go refreshBrigadeView(bot)
	})

	addMsgFunc("driver-online", func(bot *Bot, msg *proto.Msg) {
		/*
		 * Add the driver to the list, but with invalid coordinates.
		 */
		callId := msg.Str("call_id")
		id := msg.Int("id")
		if err := msg.Data.Err(); err != nil {
			bot.Err(err)
			return
		}
		bot.Neighbours[id] = &driverInfo{callId, invalidCoords}
	})

	addMsgFunc("driver-offline", func(bot *Bot, msg *proto.Msg) {
		id := msg.Int("id")
		if msg.Err() != nil {
			bot.Err(msg.Err())
			return
		}
		/*
		 * Remove the driver from the list and redraw the map.
		 */
		delete(bot.Neighbours, id)
		drawBrigade(bot)
	})

	addMsgFunc("driver-position", func(bot *Bot, msg *proto.Msg) {
		id := msg.Int("id")
		lat := msg.Dbl("latitude")
		lon := msg.Dbl("longitude")
		if msg.Err() != nil {
			bot.Err(msg.Err())
			return
		}
		if bot.Neighbours[id] == nil {
			e := fmt.Errorf("Unknown driver id (%d) in driver-position", id)
			bot.Err(e)
			return
		}
		bot.Neighbours[id].coords = [2]float64{lat, lon}

		drawBrigade(bot)
	})
}

func refreshBrigadeView(bot *Bot) {
	for {
		time.Sleep(10 * time.Second)
		drawBrigade(bot)
	}
}

func drawBrigade(bot *Bot) {
	if len(bot.Neighbours) == 0 {
		bot.Log("No drivers around")
		return
	}

	center := bot.Coords
	for id, info := range bot.Neighbours {
		distance := geo.Distance(center, info.coords)
		y := info.coords[0] - center[0]
		x := info.coords[1] - center[1]
		bot.Log("#%d (%s) %d meters at %d", id, info.callId,
			round(distance), round(math.Atan2(y, x)/math.Pi*180))
	}
	bot.Log("--")
}

func round(f float64) int {
	return int(math.Floor(f + .5))
}
