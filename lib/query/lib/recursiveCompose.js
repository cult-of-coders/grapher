import applyProps from './applyProps.js';
import {getNodeNamespace} from './createGraph';
import {isFieldInProjection} from './fieldInProjection';

/**
 * Adds _query_path fields to the cursor docs which are used for scoped query filtering on the client.
 * 
 * @param cursor 
 * @param ns 
 */
function patchCursor(cursor, ns) {
    const originalObserve = cursor.observe;
    cursor.observe = function (callbacks) {
        const newCallbacks = Object.assign({}, callbacks);
        if (callbacks.added) {
            newCallbacks.added = doc => {
                doc = _.clone(doc);
                doc[`_query_path_${ns}`] = 1;
                callbacks.added(doc);
            };
        }
        return originalObserve.call(cursor, newCallbacks);
    };
}

function patchCursorForFiltering(options) {
    const {cursor, filter} = options;
    
    // if (options.params.log) {
    //     const sessions = Meteor.server.sessions;
    //     console.log('sessions', sessions.keys());

    //     if (cursor._cursorDescription.collectionName === 'files') {
    //         sessions.forEach(session => {
    //             const view = session.collectionViews;
    //             const filesView = view.get('files');
    //             if (!filesView) {
    //                 console.log('filesView undefined');
    //             }
    //             if (filesView) {
    //                 const files = filesView.documents;
    //                 files.forEach(file => {
    //                     console.log(file.getFields());
    //                 });
    //             }
    //         });
    //     }
    // }

    const originalObserve = cursor.observe;

    cursor.observe = function (callbacks) {
        const newCallbacks = Object.assign({}, callbacks);
        if (callbacks.added) {
            newCallbacks.added = doc => {
                const filteredDoc = filter('added', doc, null, options);
                if (_.isObject(filteredDoc)) {
                    callbacks.added(filteredDoc);
                }
            };
        }
        if (callbacks.changed) {
            newCallbacks.changed = function (newDoc, oldDoc) {
                const filteredDoc = filter('changed', newDoc, oldDoc, options);
                callbacks.changed(filteredDoc, oldDoc);
            };
        }

        // this probably does not make a lot of sense
        // if (callbacks.removed) {
        //     newCallbacks.removed = doc => {
        //         callbacks.removed(doc);
        //     };
        // }
        return originalObserve.call(cursor, newCallbacks);
    };

    const originalObserveChanges = cursor.observeChanges;
    cursor.observeChanges = function (callbacks) {
        const newCallbacks = Object.assign({}, callbacks);
        if (callbacks.changed) {
            newCallbacks.changed = function (id, fields) {
                const filteredFields = filter('observe-changes', {_id: id, ...fields}, null, options);
                callbacks.changed(id, filteredFields);
            };
        }
        return originalObserveChanges.call(cursor, newCallbacks);
    };
}

function compose(node, userId, config) {
    return {
        find(...parents) {
            const [parent] = parents;
            if (parent) {
                if (!config.blocking) {
                    this.unblock();
                }

                let {filters, options} = applyProps(node);

                // composition
                let linker = node.linker;
                let accessor = linker.createLink(parent);

                // the rule is this, if a child I want to fetch is virtual, then I want to fetch the link storage of those fields
                if (linker.isVirtual()) {
                    options.fields = options.fields || {};
                    if (!isFieldInProjection(options.fields, linker.linkStorageField, true)) {
                        _.extend(options.fields, {
                            [linker.linkStorageField]: 1
                        });
                    }
                }

                const cursor = accessor.find(filters, options, userId);
                if (config.scoped) {
                    patchCursor(cursor, getNodeNamespace(node));
                }
                if (config.subscriptionFilter) {
                    patchCursorForFiltering({
                        cursor,
                        filter: config.subscriptionFilter,
                        parents,
                        linker,
                        node,
                        filters,
                        options,
                        publication: config.publication,
                        params: config.params,
                    });
                }
                return cursor;
            }
        },

        children: _.map(node.collectionNodes, n => compose(n, userId, config))
    }
}

export default (node, userId, config = {bypassFirewalls: false, scoped: false}) => {
    return {
        find() {
            if (!config.blocking) {
                this.unblock();
            }

            let {filters, options} = applyProps(node);

            const cursor = node.collection.find(filters, options, userId);
            if (config.scoped) {
                patchCursor(cursor, getNodeNamespace(node));
            }
            if (config.subscriptionFilter) {
                patchCursorForFiltering({
                    cursor,
                    filter: config.subscriptionFilter,
                    parents: [],
                    linker: null,
                    node,
                    filters,
                    options,
                    publication: config.publication,
                    params: config.params,
                });
            }
            return cursor;
        },

        children: _.map(node.collectionNodes, n => {
            const userIdToPass = (config.bypassFirewalls) ? undefined : userId;

            return compose(n, userIdToPass, config);
        })
    }
}
