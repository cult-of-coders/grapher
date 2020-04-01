import sift from 'sift';
import dot from 'dot-object';

export default function createSearchFilters(object, linker, metaFilters) {
    const fieldStorage = linker.linkStorageField;

    const strategy = linker.strategy;
    if (!linker.isVirtual()) {
        switch (strategy) {
            case 'one': return createOne(object, linker);
            case 'one-meta': return createOneMeta(object, fieldStorage, metaFilters);
            case 'many': return createMany(object, linker);
            case 'many-meta': return createManyMeta(object, fieldStorage, metaFilters);
            default:
                throw new Meteor.Error(`Invalid linking strategy: ${strategy}`)
        }
    } else {
        switch (strategy) {
            case 'one': return createOneVirtual(object, linker);
            case 'one-meta': return createOneMetaVirtual(object, fieldStorage, metaFilters);
            case 'many': return createManyVirtual(object, linker);
            case 'many-meta': return createManyMetaVirtual(object, fieldStorage, metaFilters);
            default:
                throw new Meteor.Error(`Invalid linking strategy: ${strategy}`)
        }
    }
}

function getIdQueryFieldStorage(object, fieldStorage, isMany = false) {
    const [root, ...rest] = fieldStorage.split('.');
    if (rest.length === 0) {
        return isMany ? {$in: object[fieldStorage] || []} : object[fieldStorage];
    }

    const nestedPath = rest.join('.');
    const rootValue = object[root];
    if (_.isArray(rootValue)) {
        return {$in: _.uniq(_.union(...rootValue.map(item => dot.pick(nestedPath, item))))};
    }
    else if (_.isObject(rootValue)) {
        return isMany ? {$in: dot.pick(nestedPath, rootValue) || []} : dot.pick(nestedPath, rootValue);
    }
}

export function createOne(object, linker) {
    return {
        // Using {$in: []} as a workaround because foreignIdentityField which is not _id is not required to be set
        // and {something: undefined} in query returns all the records.
        // $in: [] ensures that nothing will be returned for this query
        [linker.foreignIdentityField]: getIdQueryFieldStorage(object, linker.linkStorageField) || {$in: []},
    };
}

export function createOneVirtual(object, linker) {
    return {
        [linker.linkStorageField]: object[linker.foreignIdentityField] || {$in: []}
    };
}

export function createOneMeta(object, fieldStorage, metaFilters) {
    const value = object[fieldStorage];

    if (metaFilters) {
        if (!sift(metaFilters)(value)) {
            return {_id: undefined};
        }
    }

    return {
        _id: value ? value._id : value
    };
}

export function createOneMetaVirtual(object, fieldStorage, metaFilters) {
    let filters = {};
    if (metaFilters) {
        _.each(metaFilters, (value, key) => {
            filters[fieldStorage + '.' + key] = value;
        })
    }

    filters[fieldStorage + '._id'] = object._id;

    return filters;
}

export function createMany(object, linker) {
    return {
        [linker.foreignIdentityField]: getIdQueryFieldStorage(object, linker.linkStorageField, true) || {$in: []},
    };
}

export function createManyVirtual(object, linker) {
    return {
        [linker.linkStorageField]: object[linker.foreignIdentityField] || {$in: []},
    };
}

export function createManyMeta(object, fieldStorage, metaFilters) {
    let value = object[fieldStorage];

    if (metaFilters) {
        value = value.filter(sift(metaFilters))
    }

    return {
        _id: {
            $in: _.pluck(value, '_id') || []
        }
    };
}

export function createManyMetaVirtual(object, fieldStorage, metaFilters) {
    let filters = {};
    if (metaFilters) {
        _.each(metaFilters, (value, key) => {
            filters[key] = value;
        })
    }

    filters._id = object._id;

    return {
        [fieldStorage]: {$elemMatch: filters}
    };
}