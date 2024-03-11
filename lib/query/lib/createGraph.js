import dot from 'dot-object';
import CollectionNode from '../nodes/collectionNode.js';
import FieldNode from '../nodes/fieldNode.js';
import ReducerNode from '../nodes/reducerNode.js';
import dotize from './dotize.js';
import createReducers from '../reducers/lib/createReducers';

export const specialFields = [
    '$filters',
    '$options',
    '$postFilters',
    '$postOptions',
    '$postFilter'
];

/**
 * Creates node objects from the body. The root is always a collection node.
 *
 * @param root
 */
export function createNodes(root) {
    // this is a fix for phantomjs tests (don't really understand it.)
    if (!_.isObject(root.body)) {
        return;
    }

    root.body = sortFieldNames(root.body);

    _.each(root.body, (body, fieldName) => {
        if (!body) {
            return;
        }

        // if it's a prop
        if (_.contains(specialFields, fieldName)) {
            root.addProp(fieldName, body);

            return;
        }

        // workaround, see https://github.com/cult-of-coders/grapher/issues/134
        // TODO: find another way to do this
        if (root.collection.default) {
          root.collection = root.collection.default;
        }

        // checking if it is a link.
        let linker = root.collection.getLinker(fieldName);

        if (linker) {
            // check if it is a cached link
            // if yes, then we need to explicitly define this at collection level
            // so when we transform the data for delivery, we move it to the link name
            if (linker.isDenormalized()) {
                if (linker.isSubBodyDenormalized(body)) {
                    handleDenormalized(root, linker, body, fieldName);
                    return;
                }
            }

            let subroot = new CollectionNode(linker.getLinkedCollection(), body, fieldName);
            // must be before adding linker because _shouldCleanStorage method
            createNodes(subroot);
            root.add(subroot, linker);

            return;
        }

        // checking if it's a reducer
        const reducer = root.collection.getReducer(fieldName);

        if (reducer) {
            let reducerNode = new ReducerNode(fieldName, reducer);
            root.add(reducerNode);
        }

        // it's most likely a field then
        addFieldNode(body, fieldName, root);
    });

    createReducers(root);

    if (root.fieldNodes.length === 0) {
        root.add(new FieldNode('_id', 1));
    }
}

function sortFieldNames(body) {
    const bodyCompareFunction = function (key, value) {
        // push fields first
        if (!_.isObject(value)) {
            return 1;
        }
        return 2;
    };
    const keys = _.keys(body);
    const sortedKeys = _.sortBy(keys, function (key) {
        return bodyCompareFunction(key, body[key])
    });
    return _.object(sortedKeys, _.map(sortedKeys, function (key) {
        return body[key];
    }));
}

function isProjectionOperatorExpression(body) {
    if (_.isObject(body)) {
        const keys = _.keys(body);
        return keys.length === 1 && _.contains(['$elemMatch', '$meta', '$slice'], keys[0]);
    }
    return false;
}

function tryFindLink(root, dottizedPath) {
    // This would be the link in form of {nestedDocument: {linkedCollection: {...fields...}}}
    const parts = dottizedPath.split('.');
    const firstPart = parts.slice(0, 2);
    // Here we have a situation where we have link inside a nested document of a nested document
    // {nestedDocument: {subnestedDocument: {linkedCollection: {...fields...}}}
    const nestedParts = parts.slice(2);

    const potentialLinks = nestedParts.reduce((acc, part) => {
        return [
            ...acc,
            `${_.last(acc)}.${part}`,
        ];
    }, [firstPart.join('.')]);

    // Trying to find topmost link
    while (potentialLinks[0]) {
        const linkerKey = potentialLinks.splice(0, 1);
        const linker = root.collection.getLinker(linkerKey);
        if (linker) {
            return linker;
        }
    }
}


/**
 * @param body
 * @param fieldName
 * @param root
 */
export function addFieldNode(body, fieldName, root) {
    // it's not a link and not a special variable => we assume it's a field
    if (_.isObject(body)) {
        if (!isProjectionOperatorExpression(body)) {
            let dotted = dotize.convert({[fieldName]: body});
            _.each(dotted, (value, key) => {
                // check for link
                const linker = tryFindLink(root, key);

                if (linker && !root.hasCollectionNode(linker.linkName)) {
                    const path = linker.linkName.split('.').slice(1).join('.');
                    const subrootBody = dot.pick(path, body);

                    const subroot = new CollectionNode(linker.getLinkedCollection(), subrootBody, linker.linkName);
                    // must be before adding linker because _shouldCleanStorage method
                    createNodes(subroot);
                    root.add(subroot, linker);
                    return;
                }


                // checking if it's a reducer
                const reducer = root.collection.getReducer(key);

                if (reducer) {
                    let reducerNode = new ReducerNode(key, reducer);
                    root.add(reducerNode);
                } else {
                    root.add(new FieldNode(key, value));
                }
            });
        }
        else {
            root.add(new FieldNode(fieldName, body, true));
        }
    } else {
        let fieldNode = new FieldNode(fieldName, body);
        root.add(fieldNode);
    }
}

/**
 * Returns namespace for node when using query path scoping.
 *
 * @param node
 * @returns {String}
 */
export function getNodeNamespace(node) {
    const parts = [];
    let n = node;
    while (n) {
        // links can now contain '.' (nested links)
        const name = n.linker ? n.linker.linkName.replace(/\./, '_') : n.collection._name;
        parts.push(name);
        // console.log('linker', node.linker ? node.linker.linkName : node.collection._name);
        n = n.parent;
    }
    return parts.reverse().join('_');
}

/**
 * @param collection
 * @param body
 * @returns {CollectionNode}
 */
export default function (collection, body) {
    let root = new CollectionNode(collection, body);
    createNodes(root);

    return root;
};

/**
 * Ads denormalization config properly, including _id
 *
 * @param root
 * @param linker
 * @param body
 * @param fieldName
 */
function handleDenormalized(root, linker, body, fieldName) {
    Object.assign(body, {_id: 1});

    const cacheField = linker.linkConfig.denormalize.field;
    root.snapCache(cacheField, fieldName);

    // if it's one and direct also include the link storage
    if (!linker.isMany() && !linker.isVirtual()) {
        addFieldNode(1, linker.linkStorageField, root);
    }

    addFieldNode(body, cacheField, root);
}