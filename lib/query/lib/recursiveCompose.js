import applyProps from './applyProps.js';

export default function compose(node, userId) {
    return {
        find(parent) {
            let {filters, options} = applyProps(node);

            if (parent) {
                // composition
                let linker = node.linker;
                let accessor = linker.createLink(parent);

                // the rule is this, if a child I want to fetch is virtual, then I want to fetch the link storage of those fields
                if (linker.isVirtual()) {
                    options.fields = options.fields || {};
                    _.extend(options.fields, {
                        [linker.linkStorageField]: 1
                    });
                }

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