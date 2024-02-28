import SmartArgs from './lib/smartArguments.js';
import createSearchFilters from '../lib/createSearchFilters';

export default class Link {
    get config() { return this.linker.linkConfig; }

    get isVirtual() { return this.linker.isVirtual() }

    constructor(linker, object, collection) {
        this.linker = linker;
        this.object = object;
        this.linkedCollection = (collection) ? collection : linker.getLinkedCollection();

        if (this.linker.isVirtual()) {
            this.linkStorageField = this.config.relatedLinker.linkConfig.field;
        } else {
            this.linkStorageField = this.config.field;
        }
    }

    /**
     * Gets the stored link information value
     * @returns {*}
     */
    value() {
        if (this.isVirtual) {
            throw new Meteor.Error('You can only take the value from the main link.');
        }

        return this.object[this.linkStorageField];
    }

    /**
     * Finds linked data.
     *
     * @param filters
     * @param options
     * @returns {*}
     * @param userId
     */
    find(filters = {}, options = {}, userId = undefined) {
        let linker = this.linker;
        const linkedCollection = this.linkedCollection;

        let $metaFilters;
        if (filters.$meta) {
            $metaFilters = filters.$meta;
            delete filters.$meta;
        }

        const searchFilters = createSearchFilters(
            this.object,
            this.linker,
            $metaFilters
        );

        let appliedFilters = _.extend({}, filters, searchFilters);

        // console.log('search filters', searchFilters);

        // see https://github.com/cult-of-coders/grapher/issues/134
        // happens due to recursive importing of modules
        // TODO: find another way to do this
        if (linkedCollection.find) {
            return linkedCollection.find(appliedFilters, options, userId)
        } else {
            return linkedCollection.default.find(appliedFilters, options, userId);
        }
    }

    /**
     * @param filters
     * @param options
     * @param others
     * @returns {*|{content}|any}
     */
    fetch(filters, options, ...others) {
        let result = this.find(filters, options, ...others).fetch();

        if (this.linker.isOneResult()) {
            return _.first(result);
        }

        return result;
    }

    /**
     * This is just like fetch() but forces to get an array even if it's single result
     * 
     * @param {*} filters 
     * @param {*} options 
     * @param  {...any} others 
     */
    fetchAsArray(filters, options, ...others) {
        return this.find(filters, options, ...others).fetch()
    }

    /**
     * When we are dealing with multiple type relationships, $in would require an array. If the field value is null, it will fail
     * We use clean to make it an empty array by default.
     */
    clean() {}

    /**
     * Extracts a single id
     */
    identifyId(what, saveToDatabase) {
        return SmartArgs.getId(what, {
            saveToDatabase,
            collection: this.linkedCollection
        });
    }

    /**
     * Extracts the ids of object(s) or strings and returns an array.
     */
    identifyIds(what, saveToDatabase) {
        return SmartArgs.getIds(what, {
            saveToDatabase,
            collection: this.linkedCollection
        });
    }

    /**
     * Checks when linking data, if the ids are valid with the linked collection.
     * @throws Meteor.Error
     * @param ids
     *
     * @protected
     */
    _validateIds(ids) {
        if (!Array.isArray(ids)) {
            ids = [ids];
        }

        // console.log('validate ids', ids);

        const foreignIdentityField = this.linker.foreignIdentityField;

        const validIds = this.linkedCollection.find({
            [foreignIdentityField]: {$in: ids}
        }, {fields: {[foreignIdentityField]: 1}}).fetch().map(doc => doc[foreignIdentityField]);

        if (validIds.length != ids.length) {
            throw new Meteor.Error('not-found', `You tried to create links with non-existing id(s) inside "${this.linkedCollection._name}": ${_.difference(ids, validIds).join(', ')}`)
        }
    }

    _checkWhat(what) {
        if (what === undefined || what === null) {
            throw new Error(`The argument passed: ${what} is not accepted.`);
        }
    }

    /**
     * This is for allowing commands such as set/unset/add/remove/metadata from the virtual link.
     *
     * @param action
     * @param what
     * @param metadata
     *
     * @protected
     */
    _virtualAction(action, what, metadata) {
        const linker = this.linker.linkConfig.relatedLinker;

        // its an unset operation most likely.
        if (what === undefined) {
            const reversedLink = linker.createLink(this.fetch());
            reversedLink.unset();

            return;
        }

        if (!Array.isArray(what)) {
            what = [what];
        }

        what = _.map(what, element => {
            if (!_.isObject(element)) {
                return linker.mainCollection.findOne(element);
            } else {
                if (!element._id) {
                    const elementId = linker.mainCollection.insert(element);
                    _.extend(element, linker.mainCollection.findOne(elementId));
                }

                return element;
            }
        });

        return _.map(what, element => {
            const reversedLink = linker.createLink(element);

            if (action == 'metadata') {
                if (linker.isSingle()) {
                    return reversedLink.metadata(metadata);
                } else {
                    return reversedLink.metadata(this.object, metadata);
                }
            } else if (action == 'add' || action == 'set') {
                if (linker.isSingle()) {
                    reversedLink.set(this.object, metadata);
                } else {
                    reversedLink.add(this.object, metadata);
                }
            } else {
                if (linker.isSingle()) {
                    reversedLink.unset();
                } else {
                    reversedLink.remove(this.object);
                }
            }
        });
    }
}
