import applyProps from './applyProps.js';
import {getNodeNamespace} from './createGraph';

function patchCursor(cursor, ns) {
    const originalObserve = cursor.observe;
    cursor.observe = function (callbacks) {
        const newCallbacks = Object.assign({}, callbacks);
        if (callbacks.added) {
            newCallbacks.added = doc => {
                doc[`__query_path_${ns}`] = 1;
                callbacks.added(doc);
            };
        }
        originalObserve.call(cursor, newCallbacks);
    };
}

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

                const cursor = accessor.find(filters, options, userId);
                patchCursor(cursor, getNodeNamespace(node));
                return cursor;
            }
        },

        children: _.map(node.collectionNodes, n => compose(n, userId))
    }
}

export default (node, userId, config = {bypassFirewalls: false}) => {
    return {
        find() {
            let {filters, options} = applyProps(node);

            const cursor = node.collection.find(filters, options, userId);
            patchCursor(cursor, getNodeNamespace(node));
            return cursor;
        },

        children: _.map(node.collectionNodes, n => {
            const userIdToPass = (config.bypassFirewalls) ? undefined : userId;

            return compose(n, userIdToPass);
        })
    }
}