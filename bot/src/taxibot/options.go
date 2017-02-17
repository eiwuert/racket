package taxibot

type Config struct {
	ServerAddr string
	Login      string
	Password   string

	DeclineProb      float32 // decline order probabilty
	ArriveSignalProb float32 // arrived message probability
	BadCustomerProb  float32 // bad customer probability
	CustomOrdersFreq int     // period of custom orders
}

func MergeConfigs(opt *Config, defaults *Config) *Config {
	if opt.Password == "" {
		opt.Password = defaults.Password
	}
	if opt.ServerAddr == "" {
		opt.ServerAddr = defaults.ServerAddr
	}
	if opt.DeclineProb == 0.0 {
		opt.DeclineProb = defaults.DeclineProb
	}
	if opt.ArriveSignalProb == 0.0 {
		opt.ArriveSignalProb = defaults.ArriveSignalProb
	}
	if opt.BadCustomerProb == 0.0 {
		opt.BadCustomerProb = defaults.BadCustomerProb
	}
	if opt.CustomOrdersFreq == 0.0 {
		opt.CustomOrdersFreq = defaults.CustomOrdersFreq
	}
	result := new(Config)
	*result = *opt
	return result
}
