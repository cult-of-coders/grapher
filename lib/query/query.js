import QueryClient from './query.client';
import QueryServer from './query.server';

let Query;

if (Meteor.isServer) {
  Query = QueryServer;
} else {
  Query = QueryClient;
}

export default Query;
