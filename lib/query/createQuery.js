import Query from './query.js';

export default (data, params) => {
    if (_.keys(data).length > 1) {
        throw new Meteor.Error('invalid-query', 'When using createQuery you should only have one main root point.')
    }

    const collectionName = _.first(_.keys(data));

    const collection = Mongo.Collection.get(collectionName);

    if (!collection) {
        throw new Meteor.Error('collection-not-found', `We could not find any collection with the name ${collectionName}`)
    }

    return new Query(collection, data[collectionName], params);
}