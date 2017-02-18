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

  static error(error, context) {
    console.error(error);
    return Response.create({ success: false }, context);
  }
}

const ONE_DEG_AT_EQ_IN_MILES = 69.172;
const ONE_MILE_OF_LAT_IN_DEG = 2 / ONE_DEG_AT_EQ_IN_MILES;
const getRandomInt = max => Math.floor(Math.random() * max);
const toRadians = angle => angle * (Math.PI / 180);
const oneMileOfLonInDeg = lat =>
  1 / (Math.cos(toRadians(lat)) * ONE_DEG_AT_EQ_IN_MILES);
const getSkewedVal = (val, skew) => {
  const rand = getRandomInt(2);
  return rand === 0 ? val + skew : val - skew;
};

// eslint-disable-next-line import/prefer-default-export
export function handle(event, context, cb) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return cb(
      null,
      Response.error('Request body with valid JSON required.', context)
    );
  }

  // Convert to city and store in dynamo with timestamp
  // Return these to client delayed by 4 hours and draw Polyline of route
  // Don't store dupe lat/lon
  // https://developers.google.com/maps/documentation/geocoding/start
  // https://developers.google.com/maps/documentation/javascript/shapes
  // https://developers.google.com/maps/documentation/static-maps/intro#location
  console.log(body);

  if (body._type === 'location') {
    console.log(
      getSkewedVal(body.lat, ONE_MILE_OF_LAT_IN_DEG),
      getSkewedVal(body.lon, oneMileOfLonInDeg(body.lat))
    );
  }
  return cb(null, Response.create({ success: true }, context));
}
