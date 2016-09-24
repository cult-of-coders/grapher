import createGraph from '../query/lib/createGraph.js';
import recursiveCompose from '../query/lib/recursiveCompose.js';
import hypernova from '../query/hypernova/hypernova.js';
import ExposureConfigSchema from './exposure.config.schema.js';
import enforceMaxDepth from './lib/enforceMaxDepth.js';
import enforceMaxLimit from './lib/enforceMaxLimit.js';
import restrictFieldsFn from './lib/restrictFields.js';

let globalConfig = {};

export default class Exposure {
    static setConfig(config) {
        ExposureConfigSchema.validate(config);
        ExposureConfigSchema.clean(config);

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

        this.collection = collection;
        this.name = `exposure_${collection._name}`;

        this.config = config;
        this._validateAndClean();

        this.initSecurity();
        this.initMethod();
        this.initPublication();
    }

    _validateAndClean() {
        if (typeof(this.config) === 'function') {
            const firewall = this.config;
            this.config = {firewall};
        }

        ExposureConfigSchema.validate(this.config);
        ExposureConfigSchema.clean(this.config);

        this.config = _.extend({}, Exposure.getConfig(), this.config);
    }

    initPublication() {
        const collection = this.collection;
        const config = this.config;

        Meteor.publishComposite(this.name, function (body) {
            return recursiveCompose(
                enforceMaxDepth(
                    createGraph(collection, body),
                    config.maxDepth
                ),
                this.userId
            );
        });
    }

    initMethod() {
        const collection = this.collection;
        const config = this.config;

        Meteor.methods({
            [this.name](body) {
                return hypernova(
                    enforceMaxDepth(
                        createGraph(collection, body),
                        config.maxDepth
                    ),
                    this.userId
                );
            }
        })
    }

    initSecurity() {
        const collection = this.collection;
        const {firewall, maxLimit, restrictedFields} = this.config;
        const find = collection.find;
        const findOne = collection.findOne;

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

        collection.find = (filters, options, userId) => {
            collection.firewall(filters, options, userId);

            return find.call(collection, filters, options);
        };

        collection.findOne = (filters, options, userId) => {
            collection.firewall(filters, options, userId);

            return findOne.call(collection, filters, options);
        }
    }
}