import CollectionNode from '../nodes/collectionNode.js';
import FieldNode from '../nodes/fieldNode.js';
import dotize from './dotize.js';

const specialFields = ['$filters', '$options', '$metaFilters'];

/**
 * Creates node objects from the body
 * @param root
 */
function createNodes(root) {
    _.each(root.body, (body, fieldName) => {
        if (_.contains(specialFields, fieldName)) {
            return _.extend(root.props, {
                [fieldName]: body
            });
        }

        // checking if it is a link.
        let linker = root.collection.getLinker(fieldName);

        if (linker) {
            let subroot = new CollectionNode(linker.getLinkedCollection(), body, fieldName);
            root.add(subroot);

            return createNodes(subroot);
        }

        // it's not a link and not a special variable => we assume it's a field.
        if (_.isObject(body)) {
            let dotted = dotize.convert({[fieldName]: body});
            _.each(dotted, (value, key) => {
                root.add(new FieldNode(key, value));
            });
        } else {
            let fieldNode = new FieldNode(fieldName, body);
            root.add(fieldNode);
        }
    });
}

export default function (collection, body) {
    let root = new CollectionNode(collection, body);
    createNodes(root);

    return root;
};