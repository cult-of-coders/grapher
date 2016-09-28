import createGraph from '../query/lib/createGraph.js';
import recursiveCompose from '../query/lib/recursiveCompose.js';
import hypernova from '../query/hypernova/hypernova.js';
import ExposureConfigSchema from './exposure.config.schema.js';
import enforceMaxDepth from './lib/enforceMaxDepth.js';
import enforceMaxLimit from './lib/enforceMaxLimit.js';
import restrictFieldsFn from './lib/restrictFields.js';
import restrictLinks from './lib/restrictLinks.js';

let globalConfig = {};

export default class Exposure {
    static setConfig(config) {
        ExposureConfigSchema.clean(config);
        ExposureConfigSchema.validate(config);

        _.extend(globalConfig, config);
    }

    static getConfig() {
        return globalConfig;
    }

    static restrictFields(...args) {
        return restrictFieldsFn(...args);
    }

    constructor(collection, config = {}) {
        collection.__isExposedForGrapher = true;
        collection.__exposure = this;

        this.collection = collection;
        this.name = `exposure_${collection._name}`;

        this.config = config;
        this._validateAndClean();

        this.initSecurity();

        if (config.publication) {
            this.initPublication();
        }

        if (config.method) {
            this.initMethod();
        }
    }

    _validateAndClean() {
        if (typeof(this.config) === 'function') {
            const firewall = this.config;
            this.config = {firewall};
        }

        ExposureConfigSchema.clean(this.config);
        ExposureConfigSchema.validate(this.config);

        this.config = _.extend({}, Exposure.getConfig(), this.config);
    }

    initPublication() {
        const collection = this.collection;
        const config = this.config;

        Meteor.publishComposite(this.name, function (body) {
            const rootNode = createGraph(collection, body);

            enforceMaxDepth(rootNode, config.maxDepth);
            restrictLinks(rootNode, this.userId);

            return recursiveCompose(rootNode, this.userId);
        });
    }

    initMethod() {
        const collection = this.collection;
        const config = this.config;

        Meteor.methods({
            [this.name](body) {
                const rootNode = createGraph(collection, body);
                enforceMaxDepth(rootNode, config.maxDepth);

                restrictLinks(rootNode, this.userId);

                return hypernova(rootNode, this.userId);
            }
        });

        Meteor.methods({
            [this.name + '.count'](body) {
                return collection.find(body.$filters || {}, {}, this.userId).count();
            }
        })
    }

    initSecurity() {
        const collection = this.collection;
        const {firewall, maxLimit, restrictedFields} = this.config;
        const find = collection.find.bind(collection);
        const findOne = collection.findOne.bind(collection);

        collection.firewall = (filters, options, userId) => {
            if (userId !== undefined) {
                if (firewall) {
                    firewall.call({collection: collection}, filters, options, userId);
                }

                enforceMaxLimit(options, maxLimit);

                if (restrictedFields) {
                    Exposure.restrictFields(filters, options, restrictedFields);
                }
            }
        };

        collection.find = (filters = {}, options = {}, userId = undefined) => {
            collection.firewall(filters, options, userId);

            return find(filters, options);
        };

        collection.findOne = (filters = {}, options = {}, userId = undefined) => {
            collection.firewall(filters, options, userId);

            return findOne(filters, options);
        }
    }
};