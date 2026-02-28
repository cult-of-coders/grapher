import QueryClient from './query.client';
import QueryServer from './query.server';

/**
 * @type {typeof QueryClient | typeof QueryServer<unknown, unknown>}
 */
let Query;

if (Meteor.isServer) {
  Query = QueryServer;
} else {
  Query = QueryClient;
}

export default Query;
