export default function createSearchFilters(object, fieldStorage, strategy, isVirtual) {
    if (!isVirtual) {
        switch (strategy) {
            case 'one': return createOne(object, fieldStorage);
            case 'one-meta': return createOneMeta(object, fieldStorage);
            case 'many': return createMany(object, fieldStorage);
            case 'many-meta': return createManyMeta(object, fieldStorage);
            default:
                throw new Meteor.Error(`Invalid linking strategy: ${strategy}`)
        }
    } else {
        switch (strategy) {
            case 'one': return createOneVirtual(object, fieldStorage);
            case 'one-meta': return createOneMetaVirtual(object, fieldStorage);
            case 'many': return createManyVirtual(object, fieldStorage);
            case 'many-meta': return createManyMetaVirtual(object, fieldStorage);
            default:
                throw new Meteor.Error(`Invalid linking strategy: ${strategy}`)
        }
    }
}

export function createOne(object, fieldStorage) {
    return {
        _id: object[fieldStorage]
    };
}

export function createOneVirtual(object, fieldStorage) {
    return {
        [fieldStorage]: object._id
    };
}

export function createOneMeta(object, fieldStorage) {
    const value = object[fieldStorage];

    return {
        _id: value ? value._id : value
    };
}

export function createOneMetaVirtual(object, fieldStorage) {
    return {
        [fieldStorage + '._id']: object._id
    };
}

export function createMany(object, fieldStorage) {
    return {
        _id: {
            $in: object[fieldStorage] || []
        }
    };
}

export function createManyVirtual(object, fieldStorage) {
    return {
        [fieldStorage]: object._id
    };
}

export function createManyMeta(object, fieldStorage) {
    const value = object[fieldStorage];

    return {
        _id: {$in: _.pluck(value, '_id') || []}
    };
}

export function createManyMetaVirtual(object, fieldStorage) {
    return {
        [fieldStorage + '._id']: object._id
    };
}