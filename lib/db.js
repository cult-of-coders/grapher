import { Mongo } from 'meteor/mongo';

class DBProxy {
    get(key) {
        return Mongo.Collection.get(key);
    }
}

const db = new DBProxy();

export default db;
