import FieldNode from './fieldNode.js';
import ReducerNode from './reducerNode.js';
import deepClone from 'lodash.clonedeep';
import {check, Match} from 'meteor/check';

export default class CollectionNode {
    constructor(collection, body = {}, linkName = null) {
        if (collection && !_.isObject(body)) {
            throw new Meteor.Error('invalid-body', 'Every collection link should have its body defined as an object.');
        }

        this.body = deepClone(body);
        this.linkName = linkName;
        this.collection = collection;

        this.nodes = [];
        this.props = {};
        this.parent = null;
        this.linker = null;
        this.linkStorageField = null;
        this.scheduledForDeletion = false;
        this.reducers = [];
        this.results = [];
        this.snapCaches = {}; // {cacheField: linkName}
        this.snapCachesSingles = []; // [cacheField1, cacheField2]
    }

    get collectionNodes() {
        return _.filter(this.nodes, n => n instanceof CollectionNode)
    }

    get fieldNodes() {
        return _.filter(this.nodes, n => n instanceof FieldNode);
    }

    get reducerNodes() {
        return _.filter(this.nodes, n => n instanceof ReducerNode);
    }

    /**
     * Adds children to itself
     *
     * @param node
     * @param linker
     */
    add(node, linker) {
        node.parent = this;

        if (linker) {
            node.linker = linker;
            node.linkStorageField = linker.linkStorageField;
            node.isMeta = linker.isMeta();
            node.isVirtual = linker.isVirtual();
            node.isOneResult = linker.isOneResult();
            node.shouldCleanStorage = this._shouldCleanStorage(node);
        }

        this.nodes.push(node);
    }

    /**
     * @param prop
     * @param value
     */
    addProp(prop, value) {
        if (prop === '$postFilter') {
            check(value, Match.OneOf(Function, [Function]))
        }

        _.extend(this.props, {
            [prop]: value
        });
    }

    /**
     * @param _node
     */
    remove(_node) {
        this.nodes = _.filter(this.nodes, node => _node !== node);
    }

    /**
     * @param filters
     * @param options
     */
    applyFields(filters, options) {
        let hasAddedAnyField = false;

        _.each(this.fieldNodes, n => {
            /**
             * $meta field should be added to the options.fields, but MongoDB does not exclude other fields.
             * Therefore, we do not count this as a field addition.
             * 
             * See: https://docs.mongodb.com/manual/reference/operator/projection/meta/
             * The $meta expression specifies the inclusion of the field to the result set 
             * and does not specify the exclusion of the other fields.
             */
            if (n.projectionOperator !== '$meta') {
                hasAddedAnyField = true;
            }
            n.applyFields(options.fields)
        });

        // it will only get here if it has collectionNodes children
        _.each(this.collectionNodes, (collectionNode) => {
            let linker = collectionNode.linker;

            if (linker && !linker.isVirtual()) {
                options.fields[linker.linkStorageField] = 1;
                hasAddedAnyField = true;
            }
        });

        // if he selected filters, we should automatically add those fields
        _.each(filters, (value, field) => {
            // special handling for the $meta filter, conditional operators and text search
            if (!_.contains(['$or', '$nor', '$not', '$and', '$meta', '$text'], field)) {
                // if the field or the parent of the field already exists, don't add it
                if (!_.has(options.fields, field.split('.')[0])){
                    hasAddedAnyField = true;
                    options.fields[field] = 1;
                }
            }
        });

        if (!hasAddedAnyField) {
            options.fields = {
                _id: 1,
                // fields might contain $meta expression, so it should be added here,
                ...options.fields,
            };
        }
    }

    /**
     * @param fieldName
     * @returns {boolean}
     */
    hasField(fieldName) {
        return !!_.find(this.fieldNodes, fieldNode => {
            return fieldNode.name == fieldName
        })
    }

    /**
     * @param fieldName
     * @returns {FieldNode}
     */
    getField(fieldName) {
        return _.find(this.fieldNodes, fieldNode => {
            return fieldNode.name == fieldName
        })
    }

    /**
     * @param name
     * @returns {boolean}
     */
    hasCollectionNode(name) {
        return !!_.find(this.collectionNodes, node => {
            return node.linkName == name
        })
    }

    /**
     * @param name
     * @returns {boolean}
     */
    hasReducerNode(name) {
        return !!_.find(this.reducerNodes, node => {
            return node.name == name
        })
    }

    /**
     * @param name
     * @returns {ReducerNode}
     */
    getReducerNode(name) {
        return _.find(this.reducerNodes, node => {
            return node.name == name
        })
    }

    /**
     * @param name
     * @returns {CollectionNode}
     */
    getCollectionNode(name) {
        return _.find(this.collectionNodes, node => {
            return node.linkName == name
        })
    }

    /**
     * @returns {*}
     */
    getName() {
        return this.linkName
            ? this.linkName
            : (this.collection ? this.collection._name : 'N/A');
    }

    /**
     * This is used for caching links
     *
     * @param cacheField
     * @param subLinkName
     */
    snapCache(cacheField, subLinkName) {
        this.snapCaches[cacheField] = subLinkName;

        if (this.collection.getLinker(subLinkName).isOneResult()) {
            this.snapCachesSingles.push(cacheField);
        }
    }

    /**
     * This method verifies whether to remove the linkStorageField form the results
     * unless you specify it in your query.
     *
     * @param node
     * @returns {boolean}
     * @private
     */
    _shouldCleanStorage(node) {
        if (node.linkStorageField === '_id') {
            return false;
        } else {
            if (node.isVirtual) {
                return !node.hasField(node.linkStorageField);
            } else {
                return !this.hasField(node.linkStorageField);
            }
        }
    }
}
