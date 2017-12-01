import {Meteor} from 'meteor/meteor';
import cloneDeep from 'lodash.clonedeep';
import BaseResultCacher from './BaseResultCacher';

const DEFAULT_TTL = 60000;

/**
 * This is a very basic in-memory result caching functionality
 */
export default class MemoryResultCacher extends BaseResultCacher {
    constructor(config = {}) {
        super(config);
        this.store = {};
    }

    /**
     * @param cacheId
     * @param query
     * @param countCursor
     * @returns {*}
     */
    fetch(cacheId, {query, countCursor}) {
        const cacheData = this.store[cacheId];
        if (cacheData !== undefined) {
            return cloneDeep(cacheData);
        }

        const data = BaseResultCacher.fetchData({query, countCursor});
        this.storeData(cacheId, data);

        return data;
    }


    /**
     * @param cacheId
     * @param data
     */
    storeData(cacheId, data) {
        const ttl = this.config.ttl || DEFAULT_TTL;
        this.store[cacheId] = cloneDeep(data);

        Meteor.setTimeout(() => {
            delete this.store[cacheId];
        }, ttl)
    }
}
