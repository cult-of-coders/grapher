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
    return handleAddField(fieldName, body, root, reducerNode);
}

/**
 * @param fieldName
 * @param reducer
 * @param root
 */
export function handleAddReducer(fieldName, {body, reduce, expand}, root) {
    if (!root.hasReducerNode(fieldName)) {
        let childReducerNode = new ReducerNode(fieldName, {body, reduce, expand});
        root.add(childReducerNode);

        if (!childReducerNode.isExpander) {
            childReducerNode.scheduledForDeletion = true;
        }

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
        if (!reducerNode.isExpander) {
            collectionNode.scheduledForDeletion = true;
        }
        parent.add(collectionNode, linker);

        createNodes(collectionNode);
    }
}

/**
 * @param fieldName
 * @param body
 * @param root
 */
export function handleAddField(fieldName, body, root, reducerNode) {
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
            addFieldIfRequired(root, key, value, reducerNode);
        });
    } else {
        // if reducer does not specify a nested field, and the field does not exist.
        addFieldIfRequired(root, fieldName, body, reducerNode);
    }
}

function addFieldIfRequired(root, fieldName, body, reducerNode) {
    if (!root.hasField(fieldName, true)) {
        /**
         * Check if there are any nested fields for this field.
         * Adding root field here and scheduling for deletion would not work if there is already nested field, 
         * for example:
         * when trying to add meta: 1, it should be checked that there are no meta.* fields
         * */

        const nestedFields = root.fieldNodes.filter(({name}) => name.startsWith(`${fieldName}.`));
        // remove nested fields - important for minimongo which complains for these situations
        // TODO: excess fields are not removed (caused by adding the root field and removing nested fields) but there
        // should probably be a way to handle this in post-processing - for example by keeping a whitelist of fields
        // and removing anything else
        nestedFields.forEach(node => root.remove(node));
 
        let fieldNode = new FieldNode(fieldName, body);

        if (!reducerNode || !reducerNode.isExpander) {
            // delete only if all nested fields are scheduled for deletion (that includes the case of 0 nested fields)
            fieldNode.scheduledForDeletion = nestedFields.every(field => field.scheduledForDeletion);
        }

        root.add(fieldNode);
    }
}
