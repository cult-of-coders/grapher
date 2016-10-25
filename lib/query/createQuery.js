import Query from './query.js';
import NamedQueryStore from '../namedQuery/store.js';

export default (data, ...args) => {
    if (_.keys(data).length > 1) {
        throw new Meteor.Error('invalid-query', 'When using createQuery you should only have one main root point that represents the collection name.')
    }

    const entryPointName = _.first(_.keys(data));

    const collection = Mongo.Collection.get(entryPointName);

    if (!collection) {
        const namedQuery = NamedQueryStore.get(entryPointName);

        if (!namedQuery) {
            throw new Meteor.Error('entry-point-not-found', `We could not find any collection or named query with the name "${entryPointName}". Make sure you have them loaded in the environment you are executing *createQuery*`)
        } else {
            return namedQuery.clone(data[entryPointName], ...args);
        }
    }

    return new Query(collection, data[entryPointName], ...args);
}