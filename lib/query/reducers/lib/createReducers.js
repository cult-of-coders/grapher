import dot from 'dot-object';
import { createNodes } from '../../lib/createGraph';
import CollectionNode from '../../nodes/collectionNode';
import FieldNode from '../../nodes/fieldNode';
import ReducerNode from '../../nodes/reducerNode';
import embedReducerWithLink from './embedReducerWithLink';

export default function addReducers(root) {
    // we add reducers last, after we have added all the fields.
    root.reducerNodes.forEach(reducer => {
        _.each(reducer.body, (body, fieldName) => {
            handleAddElement(root, fieldName, body);
        })
    });
}

/**
 * @param root
 * @param fieldName
 * @param body
 */
export function handleAddElement(root, fieldName, body) {
    // if it's a link
    const collection = root.collection;
    const linker = collection.getLinker(fieldName);
    if (linker) {
        return handleAddLink(fieldName, body, root, linker);
    }

    const reducer = collection.getReducer(fieldName);
    if (reducer) {
        return handleAddReducer(fieldName, reducer, root);
    }

    // we assume it's a field in this case
    return handleAddField(fieldName, body, root);
}

/**
 * @param fieldName
 * @param reducer
 * @param root
 */
export function handleAddReducer(fieldName, reducer, root) {
    if (!root.hasReducerNode(fieldName)) {
        let reducerNode = new ReducerNode(fieldName, reducer);
        root.add(reducerNode);
        reducerNode.scheduledForDeletion = true;

        _.each(reducer.body, (body, fieldName) => {
            handleAddElement(root, fieldName, body);
        })
    }
}

/**
 * @param fieldName
 * @param body
 * @param root
 * @param linker
 */
export function handleAddLink(fieldName, body, root, linker) {
    if (root.hasCollectionNode(fieldName)) {
        const collectionNode = root.getCollectionNode(fieldName);

        embedReducerWithLink(body, collectionNode);
    } else {
        // add
        let collectionNode = new CollectionNode(linker.getLinkedCollection(), body, fieldName);
        collectionNode.scheduledForDeletion = true;
        root.add(collectionNode, linker);

        createNodes(collectionNode);
    }
}

/**
 * @param fieldName
 * @param body
 * @param root
 */
export function handleAddField(fieldName, body, root) {
    if (_.isObject(body)) {
        // if reducer specifies a nested field
        const dots = dot.dot({
            [fieldName]: body
        });

        _.each(dots, (value, key) => {
            if (!root.hasField(key)) {
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
