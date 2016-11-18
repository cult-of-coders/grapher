import dot from 'dot-object';
import { createNodes } from '../../lib/createGraph';
import CollectionNode from '../../nodes/collectionNode';
import FieldNode from '../../nodes/fieldNode';

export default function addReducers(root, reducers, addToRoot = true) {
    // we add reducers last, after we have added all the fields.
    const collection = root.collection;

    reducers.forEach(reducer => {
        if (addToRoot) {
            root.reducers.push(reducer);
        }

        _.each(reducer.body, (body, fieldName) => {
            // if it's a link
            const linker = collection.getLinker(fieldName);
            if (linker) {
                if (root.hasCollectionNode(fieldName)) {
                    // TODO: go deep and perform the same process
                    const collectionNode = root.getCollectionNode(fieldName);

                    diffWithReducerBody(body, collectionNode);

                    return;
                } else {
                    // add
                    let collectionNode = new CollectionNode(linker.getLinkedCollection(), body, fieldName);
                    collectionNode.scheduledForDeletion = true;
                    root.add(collectionNode, linker);

                    createNodes(collectionNode);
                }

                return;
            }

            const reducer = collection.getReducer(fieldName);
            if (reducer) {
                addReducers(root, [reducer]);

                return;
            }

            // we assume it's a field in this case
            handleAddField(body, root, fieldName);
        })
    });
}

/**
 * @param body
 * @param root
 * @param fieldName
 */
function handleAddField(body, fieldName, root) {
    if (_.isObject(body)) {
        // if reducer specifies a nested field
        const dots = dot.dot(body);
        _.each(dots, (value, key) => {
            if (!root.hasField(fieldName)) {
                let fieldNode = new FieldNode(key, value);
                fieldNode.scheduledForDeletion = true;

                root.add(fieldNode);
            }
        });
    } else {
        // if reducer does not specify a nested field, and the field does not exist.
        if (!root.hasField(fieldName)) {
            let fieldNode = new FieldNode(fieldName, body);
            fieldNode.scheduledForDeletion = true;

            root.add(fieldNode);
        }
    }
}

/**
 * @param reducerBody
 * @param collectionNode
 */
function diffWithReducerBody(reducerBody, collectionNode) {
    _.each(reducerBody, (value, key) => {
        const collection = collectionNode.collection;

        if (_.isObject(value)) {
            // nested field or link
            if (collectionNode.body[key]) {
                // if it exists
                const linker = collection.getLinker(key);

                // if it's a link
                if (linker) {
                    diffWithReducerBody(value, collectionNode.getCollectionNode(key));
                    return;
                }

                handleAddField(value, key, collectionNode);
            } else {
                // does not exist, so it may be a field or a linker
                const linker = collection.getLinker(key);

                // if it's a link
                if (linker) {
                    let childCollectionNode = new CollectionNode(linker.getLinkedCollection(), value, key);
                    childCollectionNode.scheduledForDeletion = true;
                    collectionNode.add(collectionNode, linker);

                    createNodes(childCollectionNode);
                    return;
                }

                const reducer = collection.getReducer(key);
                if (reducer) {
                    // if it's another reducer
                    addReducers(collectionNode, [reducer], false);
                    return;
                }

                // it's a field
                handleAddField(value, key, collectionNode)
            }
        } else {
            const reducer = collection.getReducer(key);
            if (reducer) {
                // if it's another reducer
                addReducers(collectionNode, [reducer], false);

                return;
            }

            handleAddField(value, key, collectionNode);
        }
    })
}