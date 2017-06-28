import { check } from 'meteor/check';

import NamedQuery from '../namedQuery.js';
import ExposeSchema from './schema.js';
import mergeDeep from './lib/mergeDeep.js';
import { COUNTS_COLLECTION_CLIENT } from '../constants';
import createGraph from '../../query/lib/createGraph.js';
import recursiveCompose from '../../query/lib/recursiveCompose.js';
import prepareForProcess from '../../query/lib/prepareForProcess.js';
import deepClone from '../../query/lib/deepClone.js';

// TODO: should these persist between server reboots?
const _countSessions = new Mongo.Collection(null);

_.extend(NamedQuery.prototype, {
    expose(config = {}) {
        if (!Meteor.isServer) {
            throw new Meteor.Error('invalid-environment', `You must run this in server-side code`);
        }

        if (this.isExposed) {
            throw new Meteor.Error('query-already-exposed', `You have already exposed: "${this.name}" named query`);
        }

        ExposeSchema.clean(config);
        this.exposeConfig = config;

        this._paramSchema = new SimpleSchema(this.exposeConfig.schema);

        if (config.method) {
            this._initMethod();
        }

        if (config.publication) {
            this._initPublication();
        }

        if (!config.method && !config.publication) {
            throw new Meteor.Error('weird', 'If you want to expose your named query you need to specify at least one of ["method", "publication"] options to true')
        }

        this._initCountMethod();
        this._initCountPublication();

        if (config.embody) {
            this.body = mergeDeep(
                deepClone(this.body),
                config.embody
            );
        }

        this.isExposed = true;
    },

    _initMethod() {
        const self = this;
        Meteor.methods({
            [this.name](newParams) {
                this.unblock();

                self._validateParams(newParams);

                if (self.exposeConfig.firewall) {
                    self.exposeConfig.firewall.call(this, this.userId, newParams);
                }

                return self.clone(newParams).fetch();
            }
        })
    },

    _initCountMethod() {
        const self = this;

        Meteor.methods({
            [this.name + '.count'](newParams) {
                this.unblock();
                self._validateParams(newParams);

                if (self.exposeConfig.firewall) {
                    self.exposeConfig.firewall.call(this, this.userId, newParams);
                }

                return self.clone(newParams).getCount();
            }
        });
    },

    _initCountPublication() {
        const self = this;

        Meteor.methods({
            [this.name + '.count.subscribe'](newParams) {
                self._validateParams(newParams);

                if (self.exposeConfig.firewall) {
                    self.exposeConfig.firewall.call(this, this.userId, newParams);
                }

                // If the user has already subscribed using the given parameters, reuse the old subscription
                const existingSession = _countSessions.findOne({ params: newParams, userId: this.userId });
                if (existingSession) {
                    return existingSession._id;
                }

                const token = _countSessions.insert({
                    params: newParams,
                    query: this.name,
                    userId: this.userId,
                });

                return token;
            }
        });

        Meteor.publish(this.name + '.count', function(token) {
            check(token, String);
            const publication = this;

            // Look for a token from .count.subscribe
            const request = _countSessions.findOne({
                _id: token,
                userId: publication.userId,
            });

            if (!request) {
                throw new Error('no-request', `You must acquire a request token via the "${this.name}.count.subscribe" method first.`);
            }

            const query = self.clone(request.params);
            const cursor = query.getCursor();

            // Start counting
            let count = 0;
            publication.added(COUNTS_COLLECTION_CLIENT, token, { count });
            const handle = cursor.observeChanges({
                added(id) {
                    count++;
                    publication.changed(COUNTS_COLLECTION_CLIENT, token, { count });
                },

                removed(id) {
                    count--;
                    publication.changed(COUNTS_COLLECTION_CLIENT, token, { count });
                },
            });

            publication.onStop(() => {
                handle.stop();
                _countSessions.remove(token);
            });
            publication.ready();
        });
    },

    _initPublication() {
        const self = this;

        Meteor.publishComposite(this.name, function (newParams) {
            self._validateParams(newParams);

            if (self.exposeConfig.firewall) {
                self.exposeConfig.firewall.call(this, this.userId, newParams);
            }

            let params = _.extend({}, self.params, newParams);
            let body = prepareForProcess(self.body, params);

            const rootNode = createGraph(self.collection, body);

            return recursiveCompose(rootNode);
        });
    },

    _validateParams(params) {
        if (params && this.exposeConfig.schema) {
            if (process.env.NODE_ENV !== 'production') {
                try {
                    this._paramSchema.validate(params);
                } catch (validationError) {
                    console.error(`Invalid parameters supplied to query ${this.queryName}`, validationError);
                    throw validationError; // rethrow
                }
            } else {
                this._paramSchema.validate(params);
            }
        }
    }
});