import Query from './query/query.js';
import NamedQuery from './namedQuery/namedQuery.js';
import NamedQueryStore from './namedQuery/store.js';

_.extend(Mongo.Collection.prototype, {
    createQuery(...args) {
        if (args.length === 0) {
            return new Query(this, {}, {});
        }
        
        if (typeof args[0] === 'string') {
            //NamedQuery
            const [name, body, options] = args;
            const query = new NamedQuery(name, this, body, options);
            NamedQueryStore.add(name, query);

            return query;
        } else {
            const [body, options] = args;

            return new Query(this, body, options);
        }
    },
});
