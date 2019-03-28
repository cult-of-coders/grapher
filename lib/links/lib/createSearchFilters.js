import sift from 'sift';
import dot from 'dot-object';

export default function createSearchFilters(object, fieldStorage, strategy, isVirtual, metaFilters) {
    if (!isVirtual) {
        switch (strategy) {
            case 'one': return createOne(object, fieldStorage);
            case 'one-meta': return createOneMeta(object, fieldStorage, metaFilters);
            case 'many': return createMany(object, fieldStorage);
            case 'many-meta': return createManyMeta(object, fieldStorage, metaFilters);
            default:
                throw new Meteor.Error(`Invalid linking strategy: ${strategy}`)
        }
    } else {
        switch (strategy) {
            case 'one': return createOneVirtual(object, fieldStorage);
            case 'one-meta': return createOneMetaVirtual(object, fieldStorage, metaFilters);
            case 'many': return createManyVirtual(object, fieldStorage);
            case 'many-meta': return createManyMetaVirtual(object, fieldStorage, metaFilters);
            default:
                throw new Meteor.Error(`Invalid linking strategy: ${strategy}`)
        }
    }
}

export function createOne(object, fieldStorage) {
    return {
        _id: dot.pick(fieldStorage, object)
    };
}

export function createOneVirtual(object, fieldStorage) {
    return {
        [fieldStorage]: object._id
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

export function createMany(object, fieldStorage) {
    const [root, ...nested] = fieldStorage.split('.');
    if (nested.length > 0) {
        const arr = object[root];
        const ids = arr ? _.uniq(_.union(arr.map(obj => _.isObject(obj) ? dot.pick(nested.join('.'), obj) : []))) : [];
        return {
            _id: {$in: ids}
        };
    }
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

export function createManyMeta(object, fieldStorage, metaFilters) {
    let value = object[fieldStorage];

    if (metaFilters) {
        value = sift(metaFilters, value)
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