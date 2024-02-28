import FieldNode from './fieldNode.js';
import ReducerNode from './reducerNode.js';
import deepClone from 'lodash.clonedeep';
import {check, Match} from 'meteor/check';
import {expandField, isFieldInProjection} from '../lib/fieldInProjection';

export default class CollectionNode {
    constructor(collection, body = {}, linkName = null) {
        if (collection && !_.isObject(body)) {
            throw new Meteor.Error('invalid-body', `The field "${linkName}" is a collection link, and should have its body defined as an object.`);
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

        if (node instanceof FieldNode) {
            runFieldSanityChecks(node.name);
        }
        
        if (linker) {
            node.linker = linker;
            node.linkStorageField = linker.linkStorageField;
            node.isMeta = linker.isMeta();
            node.isVirtual = linker.isVirtual();
            node.isOneResult = linker.isOneResult();
            node.shouldCleanStorage = this._shouldCleanStorage(node);

            if (linker.foreignIdentityField !== '_id' && !node.hasField(linker.foreignIdentityField, true)) {
                node.add(new FieldNode(linker.foreignIdentityField, 1));
            }
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

        Object.assign(this.props, {
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
                if (!isFieldInProjection(options.fields, linker.linkStorageField, true)) {
                    options.fields[linker.linkStorageField] = 1;
                    hasAddedAnyField = true;
                }
            }
        });

        // if he selected filters, we should automatically add those fields
        _.each(filters, (value, field) => {
            // special handling for the $meta filter, conditional operators and text search
            if (!_.contains(['$or', '$nor', '$not', '$and', '$meta', '$text', '$expr'], field)) {
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
    hasField(fieldName, checkNested = false) {
        // for checkNested flag it expands profile.phone.verified into 
        // ['profile', 'profile.phone', 'profile.phone.verified']
        // if any of these fields match it means that field exists

        const options = checkNested ? expandField(fieldName) : [fieldName];

        const result = !!_.find(this.fieldNodes, fieldNode => {
            return _.contains(options, fieldNode.name);
        });

        return result;
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
                return !node.hasField(node.linkStorageField, true);
            } else {
                return !this.hasField(node.linkStorageField, true);
            }
        }
    }
}

/**
 * Make sure that the field is ok to be added
 * @param {*} fieldName 
 */
export function runFieldSanityChecks(fieldName) {
    // Run sanity checks on the field
    if (fieldName[0] === '$') {
        throw new Error(`You are not allowed to use fields that start with $ inside a reducer's body: ${fieldName}`);
    }

    return true;
}
