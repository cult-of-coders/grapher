import genCountEndpoint from '../query/counts/genEndpoint.server.js';
import createGraph from '../query/lib/createGraph.js';
import recursiveCompose from '../query/lib/recursiveCompose.js';
import hypernova from '../query/hypernova/hypernova.js';
import ExposureConfigSchema from './exposure.config.schema.js';
import enforceMaxDepth from './lib/enforceMaxDepth.js';
import enforceMaxLimit from './lib/enforceMaxLimit.js';
import cleanBody from './lib/cleanBody.js';
import deepClone from '../query/lib/deepClone';
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

        if (!config.method && !config.publication) {
            throw new Meteor.Error('weird', 'If you want to expose your collection you need to specify at least one of ["method", "publication"] options to true')
        }

        this.initCountMethod();
        this.initCountPublication();
    }

    _validateAndClean() {
        if (typeof(this.config) === 'function') {
            const firewall = this.config;
            this.config = {firewall};
        }

        ExposureConfigSchema.clean(this.config);
        ExposureConfigSchema.validate(this.config);

        if (this.config.body) {
            ExposureConfigSchema.validateBody(this.collection, this.config.body);
        }

        this.config = _.extend({}, Exposure.getConfig(), this.config);
    }

    /**
     * Takes the body and intersects it with the exposure body, if it exists.
     *
     * @param body
     * @param userId
     * @returns {*}
     */
    getTransformedBody(body, userId) {
        if (!this.config.body) {
            return body;
        }

        const processedBody = this.getBody(userId);

        if (processedBody === true) {
            return;
        }

        return cleanBody(processedBody, body);
    }

    /**
     * Gets the exposure body
     */
    getBody(userId) {
        if (!this.config.body) {
            throw new Meteor.Error('missing-body', 'Cannot get exposure body because it was not defined.');
        }

        let body;
        if (_.isFunction(this.config.body)) {
            body = this.config.body.call(this, userId);
        } else {
            body = this.config.body;
        }

        // it means we allow everything, no need for cloning.
        if (body === true) {
            return true;
        }

        return deepClone(
            body,
            userId
        );
    }

    /**
     * Initializing the publication for reactive query fetching
     */
    initPublication() {
        const collection = this.collection;
        const config = this.config;
        const getTransformedBody = this.getTransformedBody.bind(this);

        Meteor.publishComposite(this.name, function (body) {
            let transformedBody = getTransformedBody(body);

            const rootNode = createGraph(collection, transformedBody);

            enforceMaxDepth(rootNode, config.maxDepth);
            restrictLinks(rootNode, this.userId);

            return recursiveCompose(rootNode, this.userId, {
                bypassFirewalls: !!config.body
            });
        });
    }

    /**
     * Initializez the method to retrieve the data via Meteor.call
     */
    initMethod() {
        const collection = this.collection;
        const config = this.config;
        const getTransformedBody = this.getTransformedBody.bind(this);

        const methodBody = function(body) {
            if (!config.blocking) {
                this.unblock();
            }

            let transformedBody = getTransformedBody(body);

            const rootNode = createGraph(collection, transformedBody);

            enforceMaxDepth(rootNode, config.maxDepth);
            restrictLinks(rootNode, this.userId);

            // if there is no exposure body defined, then we need to apply firewalls
            return hypernova(rootNode, this.userId, {
                bypassFirewalls: !!config.body
            });
        };

        Meteor.methods({
            [this.name]: methodBody
        });
    }

    /**
     * Initializes the method to retrieve the count of the data via Meteor.call
     * @returns {*}
     */
    initCountMethod() {
        const collection = this.collection;

        Meteor.methods({
            [this.name + '.count'](body) {
                this.unblock();

                return collection.find(body.$filters || {}, {}, this.userId).count();
            }
        })
    }

    /**
     * Initializes the reactive endpoint to retrieve the count of the data.
     */
    initCountPublication() {
        const collection = this.collection;

        genCountEndpoint(this.name, {
            getCursor(session) {
                return collection.find(session.filters, {}, this.userId);
            },

            getSession(body) {
                return { filters: body.$filters || {} };
            },
        });
    }

    /**
     * Initializes security enforcement
     * THINK: Maybe instead of overriding .find, I could store this data of security inside the collection object.
     */
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

        collection.find = function (filters, options = {}, userId = undefined) {
            if (arguments.length == 0) {
                filters = {};
            }

            // If filters is undefined it should return an empty item
            if (arguments.length > 0 && filters === undefined) {
                return find(undefined, options);
            }

            collection.firewall(filters, options, userId);

            return find(filters, options);
        };

        collection.findOne = function (filters, options = {}, userId = undefined) {
            // If filters is undefined it should return an empty item
            if (arguments.length > 0 && filters === undefined) {
                return null;
            }

            if (typeof(filters) === 'string') {
                filters = {_id: filters};
            }

            collection.firewall(filters, options, userId);

            return findOne(filters, options);
        }
    }
};
