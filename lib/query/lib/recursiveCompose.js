import { _ } from 'meteor/underscore';
import applyProps from './applyProps.js';
import { getNodeNamespace } from './createGraph';
import { isFieldInProjection } from './fieldInProjection';

/**
 * Adds _query_path fields to the cursor docs which are used for scoped query filtering on the client.
 *
 * @param {Mongo.Cursor<unknown>} cursor
 * @param {string} ns
 */
function patchCursor(cursor, ns) {
  const originalObserve = cursor.observe;
  cursor.observe = function (callbacks) {
    const newCallbacks = Object.assign({}, callbacks);
    if (callbacks.added) {
      newCallbacks.added = (doc) => {
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

  const originalObserve = cursor.observe;

  cursor.observe = function (callbacks) {
      const newCallbacks = Object.assign({}, callbacks);
      if (callbacks.added) {
          newCallbacks.added = async (doc) => {
              const filteredDoc = await filter('added', doc, null, options);
              if (_.isObject(filteredDoc)) {
                  await callbacks.added(filteredDoc);
              }
          };
      }
      if (callbacks.changed) {
          newCallbacks.changed = async function (newDoc, oldDoc) {
              const filteredDoc = await filter('changed', newDoc, oldDoc, options);
              await callbacks.changed(filteredDoc, oldDoc);
          };
      }

      return originalObserve.call(cursor, newCallbacks);
  };

  const originalObserveChanges = cursor.observeChanges;
  cursor.observeChanges = function (callbacks) {
      const newCallbacks = Object.assign({}, callbacks);
      if (callbacks.changed) {
          newCallbacks.changed = async function (id, fields) {
              const filteredFields = await filter('observe-changes', {_id: id, ...fields}, null, options);
              await callbacks.changed(id, filteredFields);
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

        let { filters, options } = applyProps(node);

        // composition
        let linker = node.linker;
        let accessor = linker.createLink(parent);

        // the rule is this, if a child I want to fetch is virtual, then I want to fetch the link storage of those fields
        if (linker.isVirtual()) {
          options.fields = options.fields || {};
          if (
            !isFieldInProjection(options.fields, linker.linkStorageField, true)
          ) {
            _.extend(options.fields, {
              [linker.linkStorageField]: 1,
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

    children: _.map(node.collectionNodes, (n) => compose(n, userId, config)),
  };
}

export default (
  node,
  userId,
  config = { bypassFirewalls: false, scoped: false },
) => {
  return {
    find() {
      if (!config.blocking) {
        this.unblock();
      }

      let { filters, options } = applyProps(node);

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

    children: _.map(node.collectionNodes, (n) => {
      const userIdToPass = config.bypassFirewalls ? undefined : userId;

      return compose(n, userIdToPass, config);
    }),
  };
};
