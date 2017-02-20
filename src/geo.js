const EARTH_RADIUS_IN_MILES = 3958.756;
const ONE_DEG_AT_EQ_IN_MILES = 69.172;
const ONE_MILE_OF_LAT_IN_DEG = 1 / ONE_DEG_AT_EQ_IN_MILES;

const getRandomInt = max => Math.floor(Math.random() * max);

const toRadians = angle => angle * (Math.PI / 180);

const oneMileOfLonInDeg = lat => 1 / (Math.cos(toRadians(lat)) * ONE_DEG_AT_EQ_IN_MILES);

const getSkewedVal = (val, skew) =>
  Number((getRandomInt(2) === 0 ? val + skew : val - skew).toFixed(6));

export const getSkewedLat = lat => getSkewedVal(lat, ONE_MILE_OF_LAT_IN_DEG);

export const getSkewedLon = (lat, lon) => getSkewedVal(lon, oneMileOfLonInDeg(lat));

export const distBetween = (lat1, lon1, lat2, lon2) => {
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return EARTH_RADIUS_IN_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
