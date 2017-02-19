import { distBetween, getSkewedLat, getSkewedLon } from './geo';
import { error, log } from './util';
import { updateLocations, getLocations } from './storage';

const trip = '2017-04-WildChild';

class Response {
  static create(body, context) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': context.awsRequestId
      },
      body: JSON.stringify(body)
    };
  }

  static error(msg, context) {
    error(msg);
    return Response.create({ success: false }, context);
  }
}

const shouldUpdate = (last, body) => {
  if (!last) return true;
  const d = distBetween(last.lat, last.lon, body.lat, body.lon);
  log(`${d} miles from last location.`);
  return d > 5;
};

// eslint-disable-next-line import/prefer-default-export
export function handle(event, context, cb) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return cb(null, Response.error(`Invalid JSON. event="${JSON.stringify(event)}"`, context));
  }

  // Return only skewed loc to client delayed by 4 hours and draw Polyline of route
  // Show marker of current loc
  // https://developers.google.com/maps/documentation/static-maps/intro#location
  const res = Response.create({ success: true }, context);
  if (body._type !== 'location') return cb(null, res);

  return getLocations(trip).then(locs => {
    locs = locs.length === 0 ? { history: [] } : locs[0];
    if (!shouldUpdate(locs.last, body)) return cb(null, res);

    const cur = {
      lat: body.lat,
      lon: body.lon,
      lats: getSkewedLat(body.lat),
      lons: getSkewedLon(body.lat, body.lon),
      time: body.tst
    };
    locs.last = cur;
    locs.history.push(cur);
    return updateLocations(trip, locs)
      .then(() => cb(null, res))
      .catch(err => cb(null, Response.error(err, context)));
  });
}
