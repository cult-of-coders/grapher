import Query from './query.js';
import NamedQuery from '../namedQuery/namedQuery.js';
import NamedQueryStore from '../namedQuery/store.js';

export default (...args) => {
    let name;
    let body;
    let rest;
    if (typeof args[0] == 'string') { //NamedQuery
        name = args[0];
        body = args[1];
        rest = args.slice(2)
    } else { //Query
        body = args[0];
        rest = args.slice(1)
    }

    if (_.keys(body).length > 1) {
        throw new Meteor.Error('invalid-query', 'When using createQuery you should only have one main root point that represents the collection name.')
    }

    const entryPointName = _.first(_.keys(body));

    const collection = Mongo.Collection.get(entryPointName);
    if (!collection) {
        if(name){ //is a NamedQuery
            throw new Meteor.Error('invalid-name', `We could not find any collection with the name "${entryPointName}". Make sure it is imported prior to using this`)
        }
        const namedQuery = NamedQueryStore.get(entryPointName);

        if (!namedQuery) {
            throw new Meteor.Error('entry-point-not-found', `We could not find any collection or named query with the name "${entryPointName}". Make sure you have them loaded in the environment you are executing *createQuery*`)
        } else {
            return namedQuery.clone(body[entryPointName], ...rest);
        }
    }

    if (name) {
        const query = new NamedQuery(name, collection, body[entryPointName], ...rest);
        NamedQueryStore.add(name, query);
        return query;
    } else {
        return new Query(collection, body[entryPointName], ...rest);
    }
}