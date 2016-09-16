import FieldNode from './fieldNode.js';

export default class CollectionNode {
    constructor(collection, body, linkName) {
        this.linkName = linkName;
        this.nodes = [];
        this.collection = collection;
        this.body = body;
        this.props = {};
        this.parent = null;
    }

    get collectionNodes() {
        return _.filter(this.nodes, n => n instanceof CollectionNode)
    }

    get fieldNodes() {
        return _.filter(this.nodes, n => n instanceof FieldNode);
    }

    get linker() {
        if (this.parent) {
            return this.parent.collection.getLinker(this.linkName)
        }
    }

    hasGlobalFieldNode() {
        return !!_.find(this.fieldNodes, n => n.isGlobal());
    }

    /**
     * @param node
     */
    add(node) {
        node.parent = this;
        this.nodes.push(node);
    }

    /**
     * @param filters
     * @param options
     */
    applyFields(filters, options) {
        let hasGlobalField = false;
        let hasAddedAnyField = false;

        if (this.hasGlobalFieldNode()) {
            return options.fields = undefined;
        }

        _.each(this.fieldNodes, n => {
            hasAddedAnyField = true;
            n.applyFields(options.fields)
        });

        // it will only get here if it has collectionNodes children
        _.each(this.collectionNodes, (collectionNode) => {
            hasAddedAnyField = true;
            let linker = collectionNode.linker;
            options.fields[linker.linkStorageField] = 1;
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
}
