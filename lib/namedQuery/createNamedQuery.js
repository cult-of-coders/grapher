import NamedQuery from './namedQuery.js';
import NamedQueryStore from './store';

/**
 * @param name
 * @param data
 * @param args
 *
 * @returns NamedQuery
 */
export default (name, data, ...args) => {
    if (_.keys(data).length > 1) {
        throw new Meteor.Error('invalid-query', 'When using createNamedQuery you should only have one main root point.')
    }

    const entryPointName = _.first(_.keys(data));
    const collection = Mongo.Collection.get(entryPointName);
    if (!collection) {
        throw new Meteor.Error('invalid-name', `We could not find any collection with the name ${entryPointName}`)
    }

    const namedQuery = new NamedQuery(name, collection, data[entryPointName], ...args);
    NamedQueryStore.add(name, namedQuery);

    return namedQuery;
}
