import { Mongo } from 'meteor/mongo';
import { COUNTS_COLLECTION_CLIENT } from './constants';

/**
 * Internal collection used to store counts on the client.
 */
export default new Mongo.Collection(COUNTS_COLLECTION_CLIENT);
