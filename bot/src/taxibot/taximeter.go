package taxibot

import (
	"time"
)

const maxSlowSpeed = 20 // km/h
const slowSecondPrice = 50000 / 3600
const meterPrice = 5

type taximeter struct {
	fastDistance int
	slowDistance int
	fastDuration int
	slowDuration int
	fastPrice    int
	slowPrice    int
	stopEvent    chan bool
	running      bool
}

func (t *taximeter) Start(bot *Bot) {
	t.fastDistance = 0.0
	t.slowDistance = 0.0
	t.fastDuration = 0
	t.slowDuration = 0
	t.fastPrice = 0
	t.slowPrice = 0
	t.stopEvent = make(chan bool)
	t.running = true
	go runTaximeter(t, bot)
}

func (t *taximeter) Stop(bot *Bot) int {
	t.running = false
	t.stopEvent <- true
	return t.slowPrice + t.fastPrice
}

func runTaximeter(t *taximeter, bot *Bot) {
	prev := bot.Odometer
	const dt = 1
	for {
		select {
		case <-t.stopEvent:
		case <-time.After(time.Second * dt):
		}

		if !t.running {
			break
		}

		dr := bot.Odometer - prev
		prev = bot.Odometer
		speed := int(bot.Speed * 3.6)

		bot.Log("dr = %d m, speed = %d km/h", dr, speed)

		if speed > maxSlowSpeed {
			t.fastDistance += dr
			t.fastDuration += dt
			t.fastPrice += meterPrice * dr
		} else {
			t.slowDistance += dr
			t.slowDuration += dt
			t.slowPrice += slowSecondPrice * dt
		}
	}
}
