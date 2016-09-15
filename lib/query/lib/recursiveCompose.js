import applyProps from './applyProps.js';

export default function compose(node, userId) {
    return {
        find(parent) {
            let {filters, options} = applyProps(node);

            if (parent) {
                // composition
                let linker = node.linker;
                let accessor = linker.createLink(parent);

                return accessor.find(filters, options, userId);
            } else {
                // it goes into the main collection
                if (node.collection.findSecure) {
                    return node.collection.findSecure(filters, options, userId);
                }

                return node.collection.find(filters, options);
            }
        },

        children: _.map(node.collectionNodes, n => compose(n, userId))
    }
}