package taxibot

import (
	"crypto/x509"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"log"
)

func readCertPool(dirpath string) (*x509.CertPool, error) {
	pool := x509.NewCertPool()

	// Open the directory
	dir, err := os.Open(dirpath)
	if err != nil {
		return nil, err
	}
	defer dir.Close()

	// Read each file and parse as a certificate
	certs, err := dir.Readdirnames(-1)
	if err != nil {
		return nil, err
	}
	for _, certPath := range certs {
		certPath = dirpath + string(os.PathSeparator) + certPath
		buf, err := ioutil.ReadFile(certPath)
		if err != nil {
			return nil, err
		}
		if !pool.AppendCertsFromPEM(buf) {
			return nil, errors.New(fmt.Sprintf("failed to parse certificate %s", certPath))
		}
		log.Printf("Added certificate %s\n", certPath);
	}
	return pool, nil
}
