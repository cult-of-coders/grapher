import prepareForProcess from '../query/lib/prepareForProcess.js';
import Base from './namedQuery.base';
import deepClone from 'lodash.clonedeep';
import MemoryResultCacher from './cache/MemoryResultCacher';
import intersectDeep from '../query/lib/intersectDeep';

export default class extends Base {
    /**
     * Retrieves the data.
     * @returns {*}
     */
    fetch(context) {
        this._performSecurityChecks(context, this.params);

        if (this.isResolver) {
            return this._fetchResolverData(context);
        } else {
            body = deepClone(this.body);
            if (this.params.$body) {
                body = intersectDeep(body, this.params.$body);
            }
            
            // we must apply emobdyment here
            this.doEmbodimentIfItApplies(body, this.params);

            const query = this.collection.createQuery(
                deepClone(body),
                {
                    params: deepClone(this.params)
                }
            );

            if (this.cacher) {
                const cacheId = this.cacher.generateQueryId(this.queryName, this.params);
                return this.cacher.fetch(cacheId, {query});
            }

            return query.fetch();
        }
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
    getCount(context) {
        this._performSecurityChecks(context, this.params);

        const countCursor = this.getCursorForCounting();

        if (this.cacher) {
            const cacheId = 'count::' + this.cacher.generateQueryId(this.queryName, this.params);

            return this.cacher.fetch(cacheId, {countCursor});
        }

        return countCursor.count();
    }

    /**
     * Returns the cursor for counting
     * This is most likely used for counts cursor
     */
    getCursorForCounting() {
        let body = deepClone(this.body);
        this.doEmbodimentIfItApplies(body, this.params);
        body = prepareForProcess(body, this.params);

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

    /**
     * Configure resolve. This doesn't actually call the resolver, it just sets it
     * @param fn
     */
    resolve(fn) {
        if (!this.isResolver) {
            throw new Meteor.Error('invalid-call', `You cannot use resolve() on a non resolver NamedQuery`);
        }

        this.resolver = fn;
    }

    /**
     * @returns {*}
     * @private
     */
    _fetchResolverData(context) {
        const resolver = this.resolver;
        const self = this;
        const query = {
            fetch() {
                return resolver.call(context, self.params);
            }
        };

        if (this.cacher) {
            const cacheId = this.cacher.generateQueryId(this.queryName, this.params);
            return this.cacher.fetch(cacheId, {query});
        }

        return query.fetch();
    }

    /**
     * @param context Meteor method/publish context
     * @param params
     *
     * @private
     */
    _performSecurityChecks(context, params) {
        if (context && this.exposeConfig) {
            this._callFirewall(context, context.userId, params);
        }

        this.doValidateParams(params);
    }
}
