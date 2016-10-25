import NamedQuery from './namedQuery.js';
import NamedQueryStore from './store';

_.extend(Mongo.Collection.prototype, {
    createdNamedQuery(name, body, params = {}) {
        const query = new NamedQuery(name, this, body, params);

        NamedQueryStore.add(name, query);

        return query;
    }
});
