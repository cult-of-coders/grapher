import dot from 'dot-object';
import { createNodes } from '../../lib/createGraph';
import CollectionNode from '../../nodes/collectionNode';
import FieldNode from '../../nodes/fieldNode';
import ReducerNode from '../../nodes/reducerNode';
import embedReducerWithLink from './embedReducerWithLink';
import { specialFields } from '../../lib/createGraph';

export default function addReducers(root) {
    // we add reducers last, after we have added all the fields.
    root.reducerNodes.forEach(reducer => {
        _.each(reducer.body, (body, fieldName) => {
            handleAddElement(reducer, root, fieldName, body);
        })
    });
}

/**
 * @param root
 * @param fieldName
 * @param body
 */
export function handleAddElement(reducerNode, root, fieldName, body) {
    // if it's a link
    const collection = root.collection;
    const linker = collection.getLinker(fieldName);
    if (linker) {
        return handleAddLink(reducerNode, fieldName, body, root, linker);
    }

    const reducer = collection.getReducer(fieldName);
    if (reducer) {
        reducerNode.dependencies.push(fieldName);
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
export function handleAddReducer(fieldName, {body, reduce}, root) {
    if (!root.hasReducerNode(fieldName)) {
        let childReducerNode = new ReducerNode(fieldName, {body, reduce});
        root.add(childReducerNode);
        childReducerNode.scheduledForDeletion = true;

        _.each(childReducerNode.body, (body, fieldName) => {
            handleAddElement(childReducerNode, root, fieldName, body);
        })
    }
}

/**
 * @param fieldName
 * @param body
 * @param root
 * @param linker
 */
export function handleAddLink(reducerNode, fieldName, body, parent, linker) {
    if (parent.hasCollectionNode(fieldName)) {
        const collectionNode = parent.getCollectionNode(fieldName);

        embedReducerWithLink(reducerNode, body, collectionNode);
    } else {
        // add
        let collectionNode = new CollectionNode(linker.getLinkedCollection(), body, fieldName);
        collectionNode.scheduledForDeletion = true;
        parent.add(collectionNode, linker);

        createNodes(collectionNode);
    }
}

/**
 * @param fieldName
 * @param body
 * @param root
 */
export function handleAddField(fieldName, body, root) {
    if (_.contains(specialFields, fieldName)) {
        root.addProp(fieldName, body);

        return;
    }

    if (_.isObject(body)) {
        // if reducer specifies a nested field
        // if it's a prop
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
