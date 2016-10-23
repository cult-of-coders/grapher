import FieldNode from './fieldNode.js';
import deepClone from '../lib/deepClone';

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
    }

    get collectionNodes() {
        return _.filter(this.nodes, n => n instanceof CollectionNode)
    }

    get fieldNodes() {
        return _.filter(this.nodes, n => n instanceof FieldNode);
    }

    /**
     * @param node
     * @param linker
     */
    add(node, linker) {
        node.parent = this;
        node.linker = linker;

        if (linker) {
            node.linkStorageField = linker.linkStorageField;
            node.isMeta = linker.isMeta();
            node.isVirtual = linker.isVirtual();
            node.isOneResult = linker.isOneResult();
            node.shouldCleanStorage = (node.isVirtual)
                ? !this.hasField(this.linkStorageField)
                : !node.parent.hasField(this.linkStorageField)
            ;
        }

        this.nodes.push(node);
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
            hasAddedAnyField = true;
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
            // special handling for the $meta filter
            if (field === '$meta') {
                return;
            }

            hasAddedAnyField = true;
            options.fields[field] = 1;
        });

        if (!hasAddedAnyField) {
            options.fields = {_id: 1};
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

    getName() {
        return this.linkName
            ? this.linkName
            : (this.collection ? this.collection._name : 'N/A');
    }
}
