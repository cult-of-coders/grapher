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

function createOne(object, fieldStorage) {
    return {
        _id: object[fieldStorage]
    };
}

function createOneVirtual(object, fieldStorage) {
    return {
        [fieldStorage]: object._id
    };
}

function createOneMeta(object, fieldStorage) {
    const value = object[fieldStorage];

    return {
        _id: value ? value._id : value
    };
}

function createOneMetaVirtual(object, fieldStorage) {
    return {
        [fieldStorage + '._id']: object._id
    };
}

function createMany(object, fieldStorage) {
    return {
        _id: {
            $in: object[fieldStorage] || []
        }
    };
}

function createManyVirtual(object, fieldStorage) {
    return {
        [fieldStorage]: object._id
    };
}

function createManyMeta(object, fieldStorage) {
    const value = object[fieldStorage];

    return {
        _id: {$in: _.pluck(value, '_id') || []}
    };
}

function createManyMetaVirtual(object, fieldStorage) {
    return {
        [fieldStorage + '._id']: object._id
    };
}