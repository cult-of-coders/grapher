import prepareForProcess from '../query/lib/prepareForProcess.js';
import deepClone from '../query/lib/deepClone.js';
import Base from './namedQuery.base';

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
        let body = prepareForProcess(this.body, this.params);
        return this.collection.find(body.$filters || {}, {}).count();
    }
}