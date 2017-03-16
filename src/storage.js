import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies
import { error } from './util';

const TRIP = '2017-04-WildChild';
const TABLE = `Locations${process.env.NODE_ENV}`;
const ddb = new aws.DynamoDB({ region: 'us-west-2' });

export const getLocations = () => ddb
  .query({
    TableName: TABLE,
    KeyConditionExpression: 'Trip = :trip',
    ExpressionAttributeValues: { ':trip': { S: TRIP } },
    ProjectionExpression: 'Locations'
  })
  .promise()
  .then(data => {
    const locs = data.Items.map(item => JSON.parse(item.Locations.S));
    return locs.length === 0 ? { history: [] } : locs[0];
  })
  .catch(err => error(err));

export const updateLocations = (locations) => ddb
  .putItem({
    Item: { Trip: { S: TRIP }, Locations: { S: JSON.stringify(locations) } },
    TableName: TABLE
  })
  .promise()
  .then(() => locations)
  .catch(err => error(err));
