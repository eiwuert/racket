package taxibot

import (
	"crypto/tls"
	"errors"
	"genera/json"
	"io/ioutil"
	"net/http"
	"net/url"
	"staxi/proto"
	"time"
)

var httpClient *http.Client

func getWebClient() *http.Client {
	if httpClient == nil {
		httpClient = createHttpClient()
	}
	return httpClient
}

func createHttpClient() *http.Client {
	pool, err := readCertPool("certs")
	if err != nil {
		return &http.Client{}
	}

	tr := &http.Transport{
		TLSClientConfig: &tls.Config{RootCAs: pool, InsecureSkipVerify: true},
	}
	return &http.Client{Transport: tr}
}

func init() {
	/*
	addInitFunc(func(bot *Bot) {
		// Obtain an access token
		token, err := getWebToken(bot)
		if err != nil {
			bot.Err(err)
			bot.Log("Error: %e", err)
			return
		}

		// Listen to events from the main server
		go processOrdersPool(bot, token)
	})*/
}

//--

func getWebToken(bot *Bot) (string, error) {
	bot.Log("authorising at the web")
	data := url.Values{"name": {bot.Config.Login},
		"password": {bot.Config.Password}}
	obj, err := bot.webRequest("auth", data)
	if err != nil {
		return "", err
	}

	tok := obj.Str("token")
	bot.Log("The token is %s", tok)
	return tok, obj.Err()
}

func processOrdersPool(bot *Bot, token string) {
	updateOrdersPool(bot, token)
	addMsgFunc("new-pool-order", func(bot *Bot, msg *proto.Msg) {
		updateOrdersPool(bot, token)
	})
}

func updateOrdersPool(bot *Bot, token string) {
	data, err := bot.webRequest("orders-pool?t="+token, nil)
	if err != nil {
		bot.Err(err)
		return
	}

	list := data.Arr("list")
	if data.Err() != nil {
		bot.Err(data.Err())
		return
	}

	bot.Log("%d orders in the pool", len(list))

	for i, order := range list {
		var timeout int64
		status := order.Str("status")

		if status == "waiting" {
			utc := order.Long("assignment_time")
			timeout = utc - time.Now().UTC().Unix()
		}

		bot.Log("Pool order %d (%d s):", i, timeout)
		printOrder(bot, order)
	}
}

func (b *Bot) webRequest(path string, data url.Values) (*json.Obj, error) {
	requestUrl := b.Config.WebPrefix + path
	var resp *http.Response
	var err error
	if data == nil {
		resp, err = getWebClient().Get(requestUrl)
	} else {
		resp, err = getWebClient().PostForm(requestUrl, data)
	}

	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	obj, err := json.Parse(body)
	if err != nil {
		return nil, err
	}

	errstr := obj.Str("errstr")
	if obj.Err() != nil {
		return nil, obj.Err()
	}

	if errstr != "ok" {
		return nil, errors.New(errstr)
	}

	return obj, nil
}
