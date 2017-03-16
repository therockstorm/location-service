/* eslint-disable no-console */
import { handle } from './src/api';

handle({ body: '{ "_type": "location" }', httpMethod: 'GET' }, { awsRequestId: 1 }, (err, res) => {
  if (err) console.log(`err=${JSON.stringify(err)}`);
  if (res) console.log(`statusCode=${res.statusCode}, body=${res.body}`);
});
