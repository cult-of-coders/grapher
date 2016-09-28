import FieldNode from './fieldNode.js';

export default class CollectionNode {
    constructor(collection, body, linkName) {
        this.body = body;
        this.linkName = linkName;
        this.collection = collection;

        this.nodes = [];
        this.props = {};
        this.parent = null;
        this.linker = null;
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
            hasAddedAnyField = true;
            options.fields[field] = 1;
        });

        if (!hasAddedAnyField) {
            options.fields = {_id: 1};
        }
    }

    parentHasMyLinkStorageFieldSpecified() {
        const storageField = this.linker.linkStorageField;

        if (this.parent) {
            return !!_.find(this.parent.fieldNodes, fieldNode => {
                return fieldNode.name == storageField
            })
        }

        return false;
    }

    getName() {
        return this.linkName
            ? this.linkName
            : (this.collection ? this.collection._name : 'N/A');
    }
}
