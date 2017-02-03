package excuse

import (
	"io/ioutil"
	"net/http"
	"strings"
)

func Get() (string, error) {
	str, err := get("http://fortune.oddonion.com/excuse.php")
	if err != nil {
		return "", err
	}

	start := "<div id=\"wisdom\">"
	stop := "<br></div>"

	pos := strings.Index(str, start) + len(start)
	str = str[pos:]
	pos = strings.Index(str, stop)
	str = str[:pos]

	return strings.Trim(str, " \t\r\n"), nil
}

func Cookie() (string, error) {
	str, err := get("http://www.fortunecookiemessage.com")
	if err != nil {
		return "", err
	}

	start := ` class="cookie-link">`
	stop := "</a>"

	pos := strings.Index(str, start) + len(start)
	str = str[pos:]
	pos = strings.Index(str, stop)
	str = str[:pos]

	return strings.Trim(str, " \t\r\n"), nil
}

func get(url string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}
