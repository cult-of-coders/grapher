import prepareForProcess from '../query/lib/prepareForProcess.js';
import Base from './namedQuery.base';
import deepClone from 'lodash.cloneDeep';
import MemoryResultCacher from './cache/MemoryResultCacher';
import generateQueryId from './cache/generateQueryId';

export default class extends Base {
    /**
     * Retrieves the data.
     * @returns {*}
     */
    fetch() {
        const query = this.collection.createQuery(
            deepClone(this.body),
            deepClone(this.params)
        );

        if (this.cacher) {
            const cacheId = generateQueryId(this.queryName, this.params);
            return this.cacher.get(cacheId, {query});
        }

        return query.fetch();
    }

    /**
     * @param args
     * @returns {*}
     */
    fetchOne(...args) {
        return _.first(this.fetch(...args));
    }

    /**
     * Gets the count of matching elements.
     *
     * @returns {any}
     */
    getCount() {
        const countCursor = this.getCursorForCounting();

        if (this.cacher) {
            const cacheId = 'count::' + generateQueryId(this.queryName, this.params);

            return this.cacher.get(cacheId, {countCursor});
        }

        return countCursor.count();
    }

    /**
     * Returns the cursor for counting
     * This is most likely used for counts cursor
     */
    getCursorForCounting() {
        let body = prepareForProcess(this.body, this.params);

        return this.collection.find(body.$filters || {}, {fields: {_id: 1}});
    }

    /**
     * @param cacher
     */
    cacheResults(cacher) {
        if (!cacher) {
            cacher = new MemoryResultCacher();
        }

        this.cacher = cacher;
    }
}