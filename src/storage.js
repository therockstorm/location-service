import aws from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies
import { error } from './util';

const table = `Locations${process.env.NODE_ENV}`;
const ddb = new aws.DynamoDB({ region: 'us-west-2' });

export const getLocations = trip => ddb
  .query({
    TableName: table,
    KeyConditionExpression: 'Trip = :trip',
    ExpressionAttributeValues: { ':trip': { S: trip } },
    ProjectionExpression: 'Locations'
  })
  .promise()
  .then(data => data.Items.map(item => JSON.parse(item.Locations.S)))
  .catch(err => error(err));

export const updateLocations = (trip, locations) => ddb
  .putItem({
    Item: { Trip: { S: trip }, Locations: { S: JSON.stringify(locations) } },
    TableName: table
  })
  .promise()
  .then(() => locations)
  .catch(err => error(err));
