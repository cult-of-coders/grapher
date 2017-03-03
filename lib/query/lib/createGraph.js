import CollectionNode from '../nodes/collectionNode.js';
import FieldNode from '../nodes/fieldNode.js';
import ReducerNode from '../nodes/reducerNode.js';
import dotize from './dotize.js';
import createReducers from '../reducers/lib/createReducers';

const specialFields = ['$filters', '$options', '$postFilter'];

/**
 * Creates node objects from the body
 * @param root
 */
export function createNodes(root) {
    // this is a fix for phantomjs tests (don't really understand it.)
    if (!_.isObject(root.body)) {
        return;
    }

    _.each(root.body, (body, fieldName) => {
        if (!body) {
            return;
        }

        // if it's a prop
        if (_.contains(specialFields, fieldName)) {
            _.extend(root.props, {
                [fieldName]: body
            });

            return;
        }

        // checking if it is a link.
        let linker = root.collection.getLinker(fieldName);

        if (linker) {
            let subroot = new CollectionNode(linker.getLinkedCollection(), body, fieldName);
            root.add(subroot, linker);

            createNodes(subroot);
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

export function addFieldNode(body, fieldName, root) {
    // it's not a link and not a special variable => we assume it's a field
    if (_.isObject(body)) {
        let dotted = dotize.convert({[fieldName]: body});
        _.each(dotted, (value, key) => {
            root.add(new FieldNode(key, value));
        });
    } else {
        let fieldNode = new FieldNode(fieldName, body);
        root.add(fieldNode);
    }
}

export default function (collection, body) {
    let root = new CollectionNode(collection, body);
    createNodes(root);

    return root;
};