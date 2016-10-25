import applyProps from './applyProps.js';

function compose(node, userId) {
    return {
        find(parent) {
            if (parent) {
                let {filters, options} = applyProps(node);

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
            }
        },

        children: _.map(node.collectionNodes, n => compose(n, userId))
    }
}

export default (node, userId, config = {bypassFirewalls: false}) => {
    return {
        find() {
            let {filters, options} = applyProps(node);

            return node.collection.find(filters, options, userId);
        },

        children: _.map(node.collectionNodes, n => {
            const userIdToPass = (config.bypassFirewalls) ? undefined : userId;

            return compose(n, userIdToPass);
        })
    }
}