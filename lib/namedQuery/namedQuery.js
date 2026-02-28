import NamedQueryClient from './namedQuery.client';
import NamedQueryServer from './namedQuery.server';

/**
 * @type {typeof NamedQueryClient | typeof NamedQueryServer}
 */
let NamedQuery;

if (Meteor.isServer) {
  NamedQuery = NamedQueryServer;
} else {
  NamedQuery = NamedQueryClient;
}

export default NamedQuery;
