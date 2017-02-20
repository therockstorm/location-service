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

const shouldUpdate = (last, body) => {
  if (!last) return true;
  const d = distBetween(last.lat, last.lon, body.lat, body.lon);
  log(`${d} miles from last location.`);
  return d > 5;
};

// eslint-disable-next-line import/prefer-default-export
export function handle(event, context, cb) {
  if (event.httpMethod === 'GET') {
    return getLocations().then(locs => cb(
      null,
      res(
        {
          last: { lat: locs.last.slat, lon: locs.last.slon },
          history: locs.history.map(h => ({ lat: h.slat, lon: h.slon }))
        },
        context
      )
    ));
  }

  const r = res({ success: true }, context);
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return cb(null, errorRes(`Invalid JSON. event="${JSON.stringify(event)}"`, r));
  }

  if (body._type !== 'location') return cb(null, r);

  return getLocations().then(locs => {
    if (!shouldUpdate(locs.last, body)) return cb(null, r);

    const cur = {
      lat: body.lat,
      lon: body.lon,
      slat: getSkewedLat(body.lat),
      slon: getSkewedLon(body.lat, body.lon),
      time: body.tst
    };
    locs.last = cur;
    locs.history.push(cur);
    return updateLocations(locs)
      .then(() => cb(null, r))
      .catch(err => cb(null, errorRes(err, context)));
  });
}
