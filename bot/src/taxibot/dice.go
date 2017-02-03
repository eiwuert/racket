package taxibot

import (
	"math/rand"
	"time"
)

func FreqWait(period int) {
	d := time.Duration(rand.Intn(2 * period))
	time.Sleep(d * time.Second)
}

func Prob(prob float32) bool {
	return rand.Float32() < prob
}
