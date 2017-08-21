import Query from './query.js';

_.extend(Mongo.Collection.prototype, {
    createQuery(...args) {
      if (args[0] == 'string') { //NamedQuery
        const name = args[0];
        const body = args[1];
        const params = args[2];

        const query = new NamedQuery(name, this, body, params);
        NamedQueryStore.add(name, query);
        
        return query;
      } else { //Query
        const body = args[0];
        const params = args[1];

        return new Query(this, body, params);
      }
    }
});