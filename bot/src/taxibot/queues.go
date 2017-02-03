package taxibot

/*
 * Functions related to taxi queues.
 */

import (
	"math/rand"
	"staxi/proto"
	"strings"
	"time"
)

type queue struct {
	id   int
	name string
}

func init() {
	addMsgFunc("service-checkpoints", msgServiceCheckpoints)
	addMsgFunc("checkpoints-update", msgCheckpointsUpdate)
	addMsgFunc("queues-update", msgQueuesUpdate)
	addMsgFunc("set-checkpoint", msgSetCheckpoint)
	addMsgFunc("status-message", msgStatusMessage)

	addMsgFunc("dialog", func(bot *Bot, msg *proto.Msg) {
		title := msg.Str("title")
		text := msg.Str("text")
		timeout := msg.Int("timeout")
		id := msg.Str("id")
		yes := msg.Str("yes")
		no := msg.Str("no")

		bot.Log("dialog: [%s] %s (%s/%s) (t=%d)", title, text, yes, no, timeout)

		/*
		 * If there is no choise, this dialog is just a notification.
		 */
		if no == "" {
			return
		}

		var result string
		if rand.Intn(100) < 10 {
			result = "no"
		} else {
			result = "yes"
		}

		var thinkTime int
		if timeout < 3 {
			thinkTime = 3 // can't react too quick
		} else {
			thinkTime = rand.Intn(timeout)
		}

		bot.Log("decided to answer %s in %d s", result, thinkTime)

		postpone(time.Duration(thinkTime)*time.Second, func() {
			bot.Send("dialog-result", &proto.Dict{"id": id, "result": result})
		})
	})
}

// Receive list of queues and start background tasks.
func msgServiceCheckpoints(bot *Bot, msg *proto.Msg) {

	queues := make([]queue, 0)

	// list is an array
	list := msg.Arr("list")
	if msg.Err() != nil {
		bot.Err(msg.Err())
		return
	}

	for _, cp := range list {
		id := cp.Int("checkpoint_id")
		name := cp.Str("name")
		if cp.Err() != nil {
			bot.Err(cp.Err())
			break
		}
		queues = append(queues, queue{id, name})
	}

	for _, q := range queues {
		bot.Log("Q: %d\t%s", q.id, q.name)
	}

	go update(bot, queues)
	go change(bot, queues)
}

func update(bot *Bot, queues []queue) {

	for {
		time.Sleep(60 * time.Second)
		bot.Send("update-checkpoints", nil)
		bot.Send("update-queues", nil)
	}
}

func change(bot *Bot, queues []queue) {

	var id int
	n := len(queues)

	for {
		time.Sleep(120 * time.Second)
		if rand.Intn(10) < 3 || n == 0 {
			id = 0
		} else {
			i := rand.Intn(n)
			id = queues[i].id
		}
		bot.Send("set-checkpoint", &proto.Dict{"checkpoint_id": id})
	}
}

func msgCheckpointsUpdate(bot *Bot, msg *proto.Msg) {

	list := msg.Arr("list")
	if msg.Err() != nil {
		bot.Err(msg.Err())
		return
	}

	for _, cp := range list {
		id := cp.Int("checkpoint_id")
		size := cp.Int("queue_length")
		if cp.Err() != nil {
			bot.Err(cp.Err())
			break
		}
		bot.Msg("Q:", id, size)
	}
}

/*
 * "queues-update" message.
 * data.queues is array.
 * data.queues[i] is object {checkpoint_id, drivers}.
 * data.queues[i].drivers is array of objects {call_id}.
 */
func msgQueuesUpdate(bot *Bot, msg *proto.Msg) {

	list := msg.Arr("queues")
	if msg.Err() != nil {
		bot.Err(msg.Err())
		return
	}

	for _, cp := range list {
		id := cp.Int("checkpoint_id")
		drivers := cp.Arr("drivers")
		if cp.Err() != nil {
			bot.Err(cp.Err())
			break
		}

		calls := make([]string, 0)
		for _, dr := range drivers {
			call_id := dr.Str("call_id")
			if dr.Err() != nil {
				bot.Err(dr.Err())
				break
			}
			calls = append(calls, call_id)
		}

		if len(calls) > 0 {
			bot.Msg(id, strings.Join(calls, ", "))
		} else {
			bot.Msg(id, "nobody")
		}
	}
}

func msgSetCheckpoint(bot *Bot, msg *proto.Msg) {
	bot.Msg("New checkpoint:", msg.Int("checkpoint_id"))
}

func msgStatusMessage(bot *Bot, msg *proto.Msg) {
	bot.Msg("Status:", msg.Str("message"))
}

func postpone(t time.Duration, f func()) {
	go (func() {
		time.Sleep(t)
		f()
	})()
}
