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
        throw new Meteor.Error('invalid-query', 'When using createNamedQuery you should only have one main root point, meaning your object should have a single key, representing the collection name.')
    }

    const entryPointName = _.first(_.keys(data));
    const collection = Mongo.Collection.get(entryPointName);
    if (!collection) {
        throw new Meteor.Error('invalid-name', `We could not find any collection with the name "${entryPointName}". Make sure it is imported prior to using this`)
    }

    const query = new NamedQuery(name, collection, data[entryPointName], ...args);

    NamedQueryStore.add(name, query);

    return query;
}
