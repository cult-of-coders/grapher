import LinkMany from './linkTypes/linkMany.js';
import LinkManyMeta from './linkTypes/linkManyMeta.js';
import LinkOne from './linkTypes/linkOne.js';
import LinkOneMeta from './linkTypes/linkOneMeta.js';
import LinkResolve from './linkTypes/linkResolve.js';
import {linkStorage as linkStorageSymbol} from './symbols.js';
import ConfigSchema from './config.schema.js';
import createFieldSchema from './lib/createFieldSchema.js';
import smartArguments from './linkTypes/lib/smartArguments';

export default class Linker {
    /**
     * @param mainCollection
     * @param linkName
     * @param linkConfig
     */
    constructor(mainCollection, linkName, linkConfig) {
        this.mainCollection = mainCollection;
        this.linkConfig = linkConfig;
        this.linkName = linkName;

        // check linkName must not exist in schema
        this._validateAndClean();
        this._extendSchema();

        // initialize cascade removal hooks.
        if (linkConfig.autoremove) {
            this._initAutoremove();
        }

        if (this.isVirtual()) {
            // if it's a virtual field make sure that when this is deleted, it will be removed from the references
            if (!linkConfig.autoremove) {
                this._handleReferenceRemovalForVirtualLinks();
            }
        } else {
            this._initIndex();
        }
    }

    /**
     * Values which represent for the relation a single link
     * @returns {string[]}
     */
    get oneTypes() {
        return ['one', '1', 'single'];
    }

    /**
     * Returns the strategies: one, many, one-meta, many-meta
     * @returns {string}
     */
    get strategy() {
        if (this.isResolver()) {
            return 'resolver';
        }

        let strategy = this.isMany() ? 'many' : 'one';
        if (this.linkConfig.metadata) {
            strategy += '-meta';
        }

        return strategy;
    }

    /**
     * Returns the field name in the document where the actual relationships are stored.
     * @returns string
     */
    get linkStorageField() {
        if (this.isVirtual()) {
            return this.linkConfig.relatedLinker.linkStorageField;
        }

        return this.linkConfig.field;
    }

    /**
     * The collection that is linked with the current collection
     * @returns Mongo.Collection
     */
    getLinkedCollection() {
        // if our link is a resolver, then we really don't have a linked collection.
        if (this.isResolver()) {
            return null;
        }

        return this.linkConfig.collection;
    }

    /**
     * If the relationship for this link is of "many" type.
     */
    isMany() {
        return !this.isSingle();
    }

    /**
     * If the relationship for this link contains metadata
     */
    isMeta() {
        if (this.isVirtual()) {
            return this.linkConfig.relatedLinker.isMeta();
        }

        return !!this.linkConfig.metadata;
    }

    /**
     * @returns {boolean}
     */
    isSingle() {
        if (this.isVirtual()) {
            return this.linkConfig.relatedLinker.isSingle();
        }

        return _.contains(this.oneTypes, this.linkConfig.type);
    }

    /**
     * @returns {boolean}
     */
    isVirtual() {
        return !!this.linkConfig.inversedBy;
    }

    /**
     * @returns {boolean}
     */
    isResolver() {
        return _.isFunction(this.linkConfig.resolve);
    }

    /**
     * Should return a single result.
     */
    isOneResult() {
        return (
            (this.isVirtual() && this.linkConfig.relatedLinker.linkConfig.unique)
            || (!this.isVirtual() && this.isSingle())
        );
    }

    /**
     * @param object
     * @param collection To impersonate the getLinkedCollection() of the "Linker"
     *
     * @returns {LinkOne|LinkMany|LinkManyMeta|LinkOneMeta|LinkResolve}
     */
    createLink(object, collection = null) {
        let helperClass = this._getHelperClass();

        return new helperClass(this, object, collection);
    }

    /**
     * @returns {*}
     * @private
     */
    _validateAndClean() {
        if (!this.isResolver()) {
            if (!this.linkConfig.collection) {
                throw new Meteor.Error('invalid-config', `For the link ${this.linkName} you did not provide a collection. Collection is mandatory for non-resolver links.`)
            }

            if (typeof(this.linkConfig.collection) === 'string') {
                const collectionName = this.linkConfig.collection;
                this.linkConfig.collection = Mongo.Collection.get(collectionName);

                if (!this.linkConfig.collection) {
                    throw new Meteor.Error('invalid-collection', `Could not find a collection with the name: ${collectionName}`);
                }
            }

            if (this.isVirtual()) {
                return this._prepareVirtual();
            } else {
                if (!this.linkConfig.type) {
                    this.linkConfig.type = 'one';
                }

                if (!this.linkConfig.field) {
                    this.linkConfig.field = this._generateFieldName();
                } else {
                    if (this.linkConfig.field == this.linkName) {
                        throw new Meteor.Error('invalid-config', `For the link ${this.linkName} you must not use the same name for the field, otherwise it will cause conflicts when fetching data`);
                    }
                }
            }
        }

        ConfigSchema.validate(this.linkConfig);
    }

    /**
     * We need to apply same type of rules in this case.
     * @private
     */
    _prepareVirtual() {
        const {collection, inversedBy} = this.linkConfig;
        let linker = collection.getLinker(inversedBy);

        if (!linker) {
            // it is possible that the collection doesn't have a linker created yet.
            // so we will create it on startup after all links have been defined
            Meteor.startup(() => {
                linker = collection.getLinker(inversedBy);
                if (!linker) {
                    throw new Meteor.Error(`You tried setting up an inversed link in "${this.mainCollection._name}" pointing to collection: "${collection._name}" link: "${inversedBy}", but no such link was found. Maybe a typo ?`)
                } else {
                    this._setupVirtualConfig(linker);
                }
            })
        } else {
            this._setupVirtualConfig(linker);
        }
    }

    /**
     * @param linker
     * @private
     */
    _setupVirtualConfig(linker) {
        const virtualLinkConfig = linker.linkConfig;

        if (!virtualLinkConfig) {
            throw new Meteor.Error(`There is no link-config for the related collection on ${inversedBy}. Make sure you added the direct links before specifying virtual ones.`)
        }

        _.extend(this.linkConfig, {
            metadata: virtualLinkConfig.metadata,
            relatedLinker: linker
        });
    }

    /**
     * Depending on the strategy, we create the proper helper class
     * @private
     */
    _getHelperClass() {
        switch (this.strategy) {
            case 'resolver':
                return LinkResolve;
            case 'many-meta':
                return LinkManyMeta;
            case 'many':
                return LinkMany;
            case 'one-meta':
                return LinkOneMeta;
            case 'one':
                return LinkOne;
        }

        throw new Meteor.Error('invalid-strategy', `${this.strategy} is not a valid strategy`);
    }

    /**
     * Extends the schema of the collection.
     * @private
     */
    _extendSchema() {
        if (this.isVirtual() || this.isResolver()) {
            return;
        }

        if (this.mainCollection.simpleSchema && this.mainCollection.simpleSchema()) {
            const schema = createFieldSchema(this.isMany(), this.linkConfig.metadata);

            this.mainCollection.attachSchema({
                [this.linkConfig.field]: schema
            });
        }
    }

    /**
     * If field name not present, we generate it.
     * @private
     */
    _generateFieldName() {
        let cleanedCollectionName = this.linkConfig.collection._name.replace(/\./g, '_');
        let defaultFieldPrefix = this.linkName + '_' + cleanedCollectionName;

        switch (this.strategy) {
            case 'many-meta':
                return `${defaultFieldPrefix}_metas`;
            case 'many':
                return `${defaultFieldPrefix}_ids`;
            case 'one-meta':
                return `${defaultFieldPrefix}_meta`;
            case 'one':
                return `${defaultFieldPrefix}_id`;
        }
    }

    /**
     * When a link that is declared virtual is removed, the reference will be removed from every other link.
     * @private
     */
    _handleReferenceRemovalForVirtualLinks() {
        this.mainCollection.after.remove((userId, doc) => {
            // this problem may occur when you do a .remove() before Meteor.startup()
            if (!this.linkConfig.relatedLinker) {
                console.warn(`There was an error finding the link for removal for collection: "${this.mainCollection._name}" with link: "${this.linkName}". This may occur when you do a .remove() before Meteor.startup()`);
                return;
            }

            let accessor = this.createLink(doc);

            _.each(accessor.fetch(), linkedObj => {
                const {relatedLinker} = this.linkConfig;
                // We do this check, to avoid self-referencing hell when defining virtual links
                // Virtual links if not found "compile-time", we will try again to reprocess them on Meteor.startup
                // if a removal happens before Meteor.startup this may fail
                if (relatedLinker) {
                    let link = relatedLinker.createLink(linkedObj);

                    if (relatedLinker.isSingle()) {
                        link.unset();
                    } else {
                        link.remove(doc);
                    }
                }
            });
        })
    }

    _initIndex() {
        if (Meteor.isServer) {
            let field = this.linkConfig.field;
            if (this.linkConfig.metadata) {
                field = field + '._id';
            }

            if (this.linkConfig.index) {
                if (this.isVirtual()) {
                    throw new Meteor.Error('You cannot set index on an inversed link.');
                }

                let options;
                if (this.linkConfig.unique) {
                    if (this.isMany()) {
                        throw new Meteor.Error('You cannot set unique property on a multi field.');
                    }

                    options = {unique: true}
                }

                this.mainCollection._ensureIndex({[field]: 1}, options);
            } else {
                if (this.linkConfig.unique) {
                    if (this.isVirtual()) {
                        throw new Meteor.Error('You cannot set unique property on an inversed link.');
                    }

                    if (this.isMany()) {
                        throw new Meteor.Error('You cannot set unique property on a multi field.');
                    }

                    this.mainCollection._ensureIndex({
                        [field]: 1
                    }, {unique: true})
                }
            }
        }
    }

    _initAutoremove() {
        if (!this.isVirtual()) {
            this.mainCollection.after.remove((userId, doc) => {
                this.getLinkedCollection().remove({
                    _id: {
                        $in: smartArguments.getIds(doc[this.linkStorageField])
                    }
                })
            })
        } else {
            this.mainCollection.after.remove((userId, doc) => {
                const linker = this.mainCollection.getLink(doc, this.linkName);
                const ids = linker.find({}, {fields: {_id: 1}}).fetch().map(item => item._id);

                this.getLinkedCollection().remove({
                    _id: {$in: ids}
                })
            })
        }
    }
}