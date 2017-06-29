import arrify from './arrify';
import mergeFragments from './mergeFragments';
import cloneDeep from '../../query/lib/deepClone';

const compilePart = (collection, name, definition) => {
    const fragment = {};
    const schema = collection.simpleSchema();

    // TODO: do reducers need special handling?
    _.each(definition, (body, key) => {
        if (_.isFunction(body)) {
            // ignore functions
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`Unknown special field ${key} supplied to fragment ${name}.`);
            }
        } else {
            const linker = collection.getLinker(key);
            if (linker) {
                if (!_.isObject(body)) {
                    throw new Meteor.Error('invalid-body', `Every collection link in a fragment should have its body defined as an object (check ${key} in fragment ${name}).`);
                } else {
                    fragment[key] = body;
                }
            } else {
                fragment[key] = body;
            }
        }
    });

    return fragment;
}

const compileFragment = (collection, name, _definition) => {
    const definition = cloneDeep(_definition);
    const parentBodies = [];
    const parentNames = arrify(definition.$composes);

    // make sure all fragments this fragment composes are assembled
    for (const parentName of parentNames) {
        const fragment = collection.getFragment(parentName);
        const body = fragment.assemble();
        parentBodies.push(body);
    }

    const thisBody = compilePart(collection, name, _.omit(definition, '$composes'));
    return mergeFragments(thisBody, ...parentBodies);
};

export default compileFragment;
