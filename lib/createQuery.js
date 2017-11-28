import Query from './query/query.js';
import NamedQuery from './namedQuery/namedQuery.js';
import NamedQueryStore from './namedQuery/store.js';

/**
 * This is a polymorphic function, it allows you to create a query as an object
 * or it also allows you to re-use an existing query if it's a named one
 *
 * @param args
 * @returns {*}
 */
export default (...args) => {
    if (typeof args[0] === 'string') {
        let [name, body, options] = args;
        options = options || {};

        // It's a resolver query
        if (_.isFunction(body)) {
            return createNamedQuery(name, null, body, options);
        }

        const entryPointName = _.first(_.keys(body));
        const collection = Mongo.Collection.get(entryPointName);

        if (!collection) {
            throw new Meteor.Error('invalid-name', `We could not find any collection with the name "${entryPointName}". Make sure it is imported prior to using this`)
        }

        return createNamedQuery(name, collection, body[entryPointName], options);
    } else {
        // Query Creation, it can have an endpoint as collection or as a NamedQuery
        let [body, options] = args;
        options = options || {};

        const entryPointName = _.first(_.keys(body));
        const collection = Mongo.Collection.get(entryPointName);

        if (!collection) {
            if (Meteor.isDevelopment && !NamedQueryStore.get(entryPointName)) {
                console.warn(`You are creating a query with the entry point "${entryPointName}", but there was no collection found for it (maybe you forgot to import it client-side?). It's assumed that it's referencing a NamedQuery.`)
            }

            return createNamedQuery(entryPointName, null, {}, {params: body[entryPointName]});
        } else {
            return createNormalQuery(collection, body[entryPointName], options);
        }
    }
}

function createNamedQuery(name, collection, body, options = {}) {
    // if it exists already, we re-use it
    const namedQuery = NamedQueryStore.get(name);
    let query;

    if (!namedQuery) {
        query = new NamedQuery(name, collection, body, options);
        NamedQueryStore.add(name, query);
    } else {
        query = namedQuery.clone(options.params);
    }

    return query;
}

function createNormalQuery(collection, body, options)  {
    return new Query(collection, body, options);
}
