import deepCompact from './deepCompact';
import mergeFragments from './mergeFragments';
import deepClone from '../../query/lib/deepClone';
import mergeDeep from '../../namedQuery/expose/lib/mergeDeep';

const recursiveMerge = (collection, body) => {
    _.each(body, (node, name) => {
        // XXX: Making the assumption that links are always on the root of the collection schema
        const linker = collection.getLinker(name);
        if (linker) {
            body[name] = _.omit(
                mergeFragments(
                    body[name],
                    getMergedFragment(
                        linker.getLinkedCollection(),
                        node
                    )
                ),
                '$fragments'
            );
        }
    });

    return body;
};

const getMergedFragment = (collection, body) => {
    if (!_.isArray(body.$fragments)) return { };

    const fragments = _.chain(body.$fragments)
        .map((fragmentName) => {
            const fragment = collection.getFragment(fragmentName);
            if (fragment) {
                return fragment.assemble();
            } else {
                // TODO error
            }
        })
        .compact()
        .value()
    ;

    return recursiveMerge(
        collection,
        mergeFragments(...fragments)
    );
};

export default (rootCollection, body) => {
    const fragmentBody = getMergedFragment(rootCollection, body);

    return deepCompact(
        mergeDeep(
            fragmentBody,
            _.omit(deepClone(body), '$fragments'),
        )
    );
};
