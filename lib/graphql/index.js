import { Mongo } from 'meteor/mongo';
import astToQuery from './lib/astToQuery';

export { setAstToQueryDefaults } from './lib/defaults';
export { default as astToBody } from './lib/astToBody';

Object.assign(Mongo.Collection.prototype, {
  astToQuery,
});

export { astToQuery };
