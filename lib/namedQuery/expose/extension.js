import NamedQuery from '../namedQuery.js';
import {ExposeSchema, ExposeDefaults} from './schema.js';
import mergeDeep from './lib/mergeDeep.js';
import createGraph from '../../query/lib/createGraph.js';
import recursiveCompose from '../../query/lib/recursiveCompose.js';
import prepareForProcess from '../../query/lib/prepareForProcess.js';
import deepClone from 'lodash.clonedeep';
import genCountEndpoint from '../../query/counts/genEndpoint.server';
import {check} from 'meteor/check';

const specialParameters = ['$body'];

_.extend(NamedQuery.prototype, {
    expose(config = {}) {
        if (!Meteor.isServer) {
            throw new Meteor.Error('invalid-environment', `You must run this in server-side code`);
        }

        if (this.isExposed) {
            throw new Meteor.Error('query-already-exposed', `You have already exposed: "${this.name}" named query`);
        }

        this.exposeConfig = Object.assign({}, ExposeDefaults, config);
        check(this.exposeConfig, ExposeSchema);

        if (this.exposeConfig.method) {
            this._initMethod();
        }

        if (this.exposeConfig.publication) {
            this._initPublication();
        }

        if (!this.exposeConfig.method && !this.exposeConfig.publication) {
            throw new Meteor.Error('weird', 'If you want to expose your named query you need to specify at least one of ["method", "publication"] options to true')
        }

        this._initCountMethod();
        this._initCountPublication();

        if (this.exposeConfig.embody) {
            this.body = mergeDeep(
                deepClone(this.body),
                this.exposeConfig.embody
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

        genCountEndpoint(self.name, {
            getCursor(session) {
                const query = self.clone(session.params);
                return query.getCursorForCounting();
            },

            getSession(newParams) {
                self._validateParams(newParams);
                if (self.exposeConfig.firewall) {
                    self.exposeConfig.firewall.call(this, this.userId, newParams);
                }

                return { params: newParams };
            },
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
            const body = prepareForProcess(self.body, params);

            const rootNode = createGraph(self.collection, body);

            return recursiveCompose(rootNode);
        });
    },

    _validateParams(params) {
        if (this.exposeConfig.schema) {
            const paramsToValidate = _.omit(params, ...specialParameters);

            if (process.env.NODE_ENV !== 'production') {
                try {
                    check(paramsToValidate, this._paramSchema);
                } catch (validationError) {
                    console.error(`Invalid parameters supplied to query ${this.queryName}`, validationError);
                    throw validationError; // rethrow
                }
            } else {
                check(paramsToValidate, this._paramSchema);
            }
        }
    }
});