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

    /**
     * @param node
     */
    add(node) {
        node.parent = this;
        this.nodes.push(node);
    }

    /**
     * @param options
     */
    applyFields(options) {
        options.fields = options.fields || {_id: 1};

        let fieldNodes = _.filter(this.nodes, n => n instanceof FieldNode);
        _.each(fieldNodes, n => n.applyFields(options.fields))
    }

    /**
     * @param field
     * @returns {boolean}
     */
    hasField(field) {
        return !!_.find(this.fieldNodes, n => n.name == field)
    }
}
