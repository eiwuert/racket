package geo

import "math"

const EARTH_RADIUS_M = 6378137

type Point [2]float64

/*
 * Haversine formula for distance.
 */
func Distance(from, to Point) float64 {

	lat1 := from[0]
	lon1 := from[1]
	lat2 := to[0]
	lon2 := to[1]

	d2r := math.Pi / 180
	dLat := (lat2 - lat1) * d2r
	dLon := (lon2 - lon1) * d2r

	lat1 *= d2r
	lat2 *= d2r
	sin1 := math.Sin(dLat / 2)
	sin2 := math.Sin(dLon / 2)

	a := sin1*sin1 + sin2*sin2*math.Cos(lat1)*math.Cos(lat2)
	d := EARTH_RADIUS_M * 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return d
}

func Delta(from Point, latMeters, lonMeters float64) Point {
	lat := from[0] * math.Pi / 180
	dlat := latMeters / EARTH_RADIUS_M
	dlon := 2 * math.Asin(
		math.Sin(lonMeters/2/EARTH_RADIUS_M)/math.Abs(math.Cos(lat)))
	return Point{dlat * 180 / math.Pi, dlon * 180 / math.Pi}
}
