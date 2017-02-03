package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"log"
	"taxibot"
	"time"
)

/*
 * The config file has two sections, defaults and bots. Defaults
 * is a set of bot options which should be assumed for each
 * particular bot unless overridden.
 */
type config struct {
	Defaults taxibot.Config
	Bots     []taxibot.Config
}

func main() {
	var configPath string
	flag.StringVar(&configPath, "c", "config.json", "config file path")
	flag.Parse()

	configs := readConfig(configPath)
	done := make(chan bool)
	for _, config := range configs {
		go runBot(config, done)
		time.Sleep(3 * time.Second)
	}
	for i := 0; i < len(configs); i++ {
		<-done
	}
	log.Println("Done.")
}

func runBot(conf *taxibot.Config, done chan bool) {
	err := taxibot.Run(*conf)
	if err != nil {
		log.Println(err)
	}
	done <- true
}

func readConfig(path string) []*taxibot.Config {
	/*
	 * Parse the local configuration file.
	 */
	data, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}
	var config config
	err = json.Unmarshal(data, &config)
	if err != nil {
		log.Fatal(err)
	}

	/*
	 * Convert to taxi bot configs.
	 */
	configs := make([]*taxibot.Config, 0)
	for _, botConfig := range config.Bots {
		configs = append(configs, taxibot.MergeConfigs(&botConfig, &config.Defaults))
	}
	return configs
}
