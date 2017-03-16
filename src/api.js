import { distBetween, getSkewedLat, getSkewedLon } from './geo';
import { error, log } from './util';
import { updateLocations, getLocations } from './storage';

const res = (body, context) => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Request-Id': context.awsRequestId
  },
  body: JSON.stringify(body)
});

const errorRes = (msg, r) => {
  error(msg);
  return r;
};

const shouldUpdateLoc = (last, body) => {
  if (!last) return true;
  const d = distBetween(last.lat, last.lon, body.lat, body.lon);
  log(`${d} miles from last location.`);
  return d > 5;
};

const shouldUpdate = (headers, body) =>
  body._type === 'location' &&
    headers['x-limit-d'] === process.env.LIMIT_D &&
    headers['x-limit-u'] === process.env.LIMIT_U &&
    body.lat !== 0 &&
    body.lon !== 0;

const getLoc = loc => ({ lat: loc.slat, lon: loc.slon, time: loc.time });

// eslint-disable-next-line import/prefer-default-export
export function handle(event, context, cb) {
  log(event);

  if (event.httpMethod === 'GET') {
    return getLocations().then(locs =>
      cb(
        null,
        res({ last: getLoc(locs.last), history: locs.history.map(h => getLoc(h)) }, context)
      ));
  }

  const r = res({ success: true }, context);
  let headers;
  let body;
  try {
    headers = JSON.parse(event.headers);
    body = JSON.parse(event.body);
  } catch (e) {
    return cb(null, errorRes(`Invalid JSON. event="${JSON.stringify(event)}"`, r));
  }

  if (!shouldUpdate(headers, body)) return cb(null, r);

  return getLocations().then(locs => {
    if (shouldUpdateLoc(locs.last, body)) {
      const cur = {
        lat: body.lat,
        lon: body.lon,
        slat: getSkewedLat(body.lat),
        slon: getSkewedLon(body.lat, body.lon),
        time: body.tst
      };
      locs.last = cur;
      locs.history.push(cur);
    } else {
      locs.last.time = body.tst;
    }

    return updateLocations(locs).then(() => cb(null, r)).catch(err => cb(null, errorRes(err, r)));
  });
}
