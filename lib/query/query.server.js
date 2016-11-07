import createGraph from './lib/createGraph.js';
import prepareForProcess from './lib/prepareForProcess.js';
import hypernova from './hypernova/hypernova.js';
import Base from './query.base';

export default class Query extends Base {
    /**
     * Retrieves the data.
     * @param options
     * @returns {*}
     */
    fetch(options = {}) {
        const node = createGraph(
            this.collection,
            prepareForProcess(this.body, this.params)
        );

        return hypernova(node, options.userId);
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
     * @returns {integer}
     */
    getCount() {
        return this.collection.find(this.body.$filters || {}, {}).count();
    }
}