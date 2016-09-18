import SmartArgs from './lib/smartArguments.js';

export default class Link {
    get config() { return this.linker.linkConfig; }

    get isVirtual() { return this.linker.isVirtual() }

    constructor(linker, object) {
        this.linker = linker;
        this.object = object;
    }

    /**
     * Gets the stored link information value
     * @returns {*}
     */
    value() {
        if (this.isVirtual) {
            throw new Meteor.Error('You can only take the value from the main link.');
        }

        return this.object[this.getLinkStorageField()];
    }

    /**
     * Returns the field name where the links are stored.
     *
     * @returns string
     */
    getLinkStorageField() {
        if (this.linker.isVirtual()) {
            return this.config.relatedLinker.linkConfig.field;
        } else {
            return this.config.field;
        }
    }

    /**
     * Finds linked data.
     *
     * @param filters
     * @param options
     * @returns {*}
     * @param userId
     */
    find(filters = {}, options = {}, userId = null) {
        let linker = this.linker;
        this.clean();

        const linkedCollection = linker.getLinkedCollection();

        if (!linker.isVirtual()) {
            this.applyFindFilters(filters);
        } else {
            this.applyFindFiltersForVirtual(filters);
        }

        if (linkedCollection.findSecure) {
            return linkedCollection.findSecure(filters, options, userId);
        } else {
            return linkedCollection.find(filters, options);
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

        if (this.linker.isSingle()) {
            return _.first(result);
        }

        return result;
    }

    /**
     * When we are dealing with multiple type relationships, $in would require an array. If the field value is null, it will fail
     * We use clean to make it an empty array by default.
     */
    clean() {}

    /**
     * We have an object stored. Based on that object. How do I receive the related elements ?
     */
    applyFindFilters(filters) { throw 'Not Implemented' }

    /**
     * I have a virtual link, how should I search in the other collection to retrieve my data ?
     */
    applyFindFiltersForVirtual(filters) { throw 'Not Implemented'; }

    /**
     * Extracts a single id
     */
    identifyId(what, saveToDatabase) {
        return SmartArgs.getId(what, {
            saveToDatabase,
            collection: this.linker.getLinkedCollection()
        });
    }

    /**
     * Extracts the ids of object(s) or strings and returns an array.
     */
    identifyIds(what, saveToDatabase) {
        return SmartArgs.getIds(what, {
            saveToDatabase,
            collection: this.linker.getLinkedCollection()
        });
    }

    /**
     * This is for allowing commands such as set/unset/add/remove/metadata from the virtual link.
     *
     * @param action
     * @param what
     * @private
     */
    _virtualAction(action, what, metadata) {
        const linker = this.linker.linkConfig.relatedLinker;

        // its an unset operation most likely.
        if (what === undefined) {
            const reversedLink = linker.createLink(this.fetch());
            reversedLink.unset();

            return;
        }

        if (!_.isArray(what)) {
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
                    return relatedLink.metadata(metadata);
                } else {
                    return relatedLink.metadata(this.object, metadata);
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