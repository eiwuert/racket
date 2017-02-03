package geo

import (
	"bytes"
)

const (
	padding   = 63
	valueBits = 5
	precision = 1e-6
)

func DecodePolyLine(data []byte) ([]Point, error) {

	var lat, lon float64
	coords := make([]Point, 0)

	r := bytes.NewReader(data)

	for {
		dlat, dlon, err := getPair(r)
		if err != nil {
			break
		}
		lat += dlat
		lon += dlon
		coords = append(coords, Point{lat, lon})
	}

	return coords, nil
}

func getPair(r *bytes.Reader) (float64, float64, error) {
	var dlat, dlon float64
	dlat, err := getValue(r)
	if err != nil {
		return 0, 0, err
	}
	dlon, err = getValue(r)
	if err != nil {
		return 0, 0, err
	}
	return dlat, dlon, nil
}

func getValue(r *bytes.Reader) (float64, error) {
	var result int32 = 0
	var shift uint = 0
	var b byte
	var value int32
	var err error

	for {
		b, err = r.ReadByte()
		if err != nil {
			return 0, err
		}

		// every byte was added 63 to keep the values printable.
		b -= padding

		// 5 bits are dedicated to the value.
		value = int32(b & 0x1F)

		// least significant parts are read first
		result |= (value << shift)
		shift += valueBits

		// The 6th bit is set to one if more bytes have to be read.
		if b&0x20 == 0 {
			break
		}
	}

	// If the first bit is one, then the original value is negative,
	// and it was inverted.
	if result&1 == 1 {
		result = ^result
	}
	// Don't need that bit anymore.
	result >>= 1

	return float64(result) * precision, nil
}
