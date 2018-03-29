import { Mongo } from 'meteor/mongo';
export { default as astToBody } from './lib/astToBody';
export { default as astToQuery } from './lib/astToQuery';
export { setAstToQueryDefaults } from './lib/defaults';

Object.assign(Mongo.Collection.prototype, {
    astToQuery,
});
