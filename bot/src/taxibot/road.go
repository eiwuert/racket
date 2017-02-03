package taxibot

import (
	"geo"
	"math/rand"
	"staxi/proto"
	"time"
)

type area struct {
	center geo.Point
	delta  geo.Point
}

func init() {
	addInitFunc(initRoad)
	addMsgFunc("route-2", msgRoute)
}

func initRoad(bot *Bot) {
	// Define roaming area
	center := geo.Point{53.9002861, 27.5537109}
	travel := &area{center, geo.Delta(center, 6000, 6200)}
	bot.Coords = randomPosition(travel)

	// Set random odometer value
	bot.Odometer = int(rand.Intn(500000) + 100000)
	// Get route
	requestRoute(bot, travel)
}

func requestRoute(bot *Bot, travel *area) {
	dest := randomPosition(travel)
	bot.Send("get-route-2", &proto.Dict{
		"latitude1":  bot.Coords[0],
		"longitude1": bot.Coords[1],
		"latitude2":  dest[0],
		"longitude2": dest[1]})
}

func msgRoute(bot *Bot, msg *proto.Msg) {
	enc := msg.Str("points")
	points, _ := geo.DecodePolyLine([]byte(enc))
	bot.Msg("Received", len(points), "points")
	go travel(bot, points)
}

func travel(bot *Bot, points []geo.Point) {
	n := len(points)
	for i := 0; i < n; i++ {
		pointTravel(bot, points[i])
	}
}

// Travel to the given point
func pointTravel(bot *Bot, point geo.Point) {
	const dt = 1         // seconds
	bot.Speed = 40 / 3.6 // m/s

	for {
		dr := bot.Speed * dt
		dist := geo.Distance(bot.Coords, point)
		if dist < 2 {
			break
		}
		if dr > dist {
			dr = dist
			bot.Speed = dr / dt
		}
		bot.Coords[0] += (point[0] - bot.Coords[0]) * dr / dist
		bot.Coords[1] += (point[1] - bot.Coords[1]) * dr / dist
		bot.Odometer += int(dr)
		time.Sleep(dt * time.Second)
	}
}

func randomPosition(travel *area) geo.Point {
	dlat := (rand.Float64()*2 - 1.0) * travel.delta[0]
	dlon := (rand.Float64()*2 - 1.0) * travel.delta[1]
	lat := travel.center[0] + dlat
	lon := travel.center[1] + dlon
	return geo.Point{lat, lon}
}
