import {Meteor} from 'meteor/meteor';
import cloneDeep from 'lodash.cloneDeep';

const DEFAULT_TTL = 60000;

/**
 * This is a very basic in-memory result caching functionality
 */
export default class MemoryResultCacher {
    constructor(config = {}) {
        this.store = {};
        this.config = config;
    }

    get(cacheId, {
        query,
        countCursor,
    }) {
        const cacheData = this.store[cacheId];
        if (cacheData !== undefined) {
            return cloneDeep(cacheData);
        }

        let data;
        if (query) {
            data = query.fetch();
        } else {
            data = countCursor.count();
        }

        this.set(cacheId, data);

        return data;
    }

    set(cacheId, data) {
        const ttl = this.config.ttl || DEFAULT_TTL;
        this.store[cacheId] = cloneDeep(data);

        Meteor.setTimeout(() => {
            delete this.store[cacheId];
        }, ttl)
    }
}
