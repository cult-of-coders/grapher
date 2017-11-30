import {EJSON} from 'meteor/ejson';

/**
 * This is a very basic in-memory result caching functionality
 */
export default class BaseResultCacher {
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * @param queryName
     * @param params
     * @returns {string}
     */
    generateQueryId(queryName, params) {
        return `${queryName}::${EJSON.stringify(params)}`;
    }

    /**
     * Dummy function
     */
    fetch(cacheId, {query, countCursor}) {
        throw 'Not implemented';
    }

    /**
     * @param query
     * @param countCursor
     * @returns {*}
     */
    static fetchData({query, countCursor}) {
        if (query) {
            return query.fetch();
        } else {
            return countCursor.count();
        }
    }
}
