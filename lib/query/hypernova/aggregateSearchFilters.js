import sift from 'sift';
import dot from 'dot-object';

function extractIdsFromArray(array, field) {
    return (array || []).map(obj => _.isObject(obj) ? dot.pick(field, obj) : undefined).filter(v => !!v);
}

/**
 * Its purpose is to create filters to get the related data in one request.
 */
export default class AggregateFilters {
    constructor(collectionNode, metaFilters) {
        this.collectionNode = collectionNode;
        this.linker = collectionNode.linker;
        this.metaFilters = metaFilters;
        this.isVirtual = this.linker.isVirtual();

        this.linkStorageField = this.linker.linkStorageField;
    }

    get parentObjects() {
        return this.collectionNode.parent.results;
    }

    create() {
        switch (this.linker.strategy) {
            case 'one':
                return this.createOne();
            case 'one-meta':
                return this.createOneMeta();
            case 'many':
                return this.createMany();
            case 'many-meta':
                return this.createManyMeta();
            default:
                throw new Meteor.Error(`Invalid linker type: ${this.linker.type}`);
        }
    }

    createOne() {
        if (!this.isVirtual) {
            return {
                _id: {
                    $in: _.uniq(extractIdsFromArray(this.parentObjects, this.linkStorageField))
                }
            };
        } else {
            return {
                [this.linkStorageField]: {
                    $in: _.uniq(
                        _.pluck(this.parentObjects, '_id')
                    )
                }
            };
        }
    }

    createOneMeta() {
        if (!this.isVirtual) {
            let eligibleObjects = this.parentObjects;

            if (this.metaFilters) {
                eligibleObjects = _.filter(this.parentObjects, object => {
                    return sift(this.metaFilters)(object[this.linkStorageField]);
                });
            }

            const storages = _.pluck(eligibleObjects, this.linkStorageField);
            let ids = [];
            _.each(storages, storage => {
                if (storage) {
                    ids.push(storage._id);
                }
            });

            return {
                _id: {$in: _.uniq(ids)}
            };
        } else {
            let filters = {};
            if (this.metaFilters) {
                _.each(this.metaFilters, (value, key) => {
                    filters[this.linkStorageField + '.' + key] = value;
                })
            }

            filters[this.linkStorageField + '._id'] = {
                $in: _.uniq(
                    _.pluck(this.parentObjects, '_id')
                )
            };

            return filters;
        }
    }

    createMany() {
        if (!this.isVirtual) {
            const [root, ...nested] = this.linkStorageField.split('.');
            const arrayOfIds = _.union(...extractIdsFromArray(this.parentObjects, root));
            return {
                _id: {
                    $in: _.uniq(nested.length > 0 ? extractIdsFromArray(arrayOfIds, nested.join('.')) : arrayOfIds)
                }
            };
        } else {
            const arrayOfIds = _.pluck(this.parentObjects, '_id');
            return {
                [this.linkStorageField]: {
                    $in: _.uniq(
                        _.union(...arrayOfIds)
                    )
                }
            };
        }
    }

    createManyMeta() {
        if (!this.isVirtual) {
            let ids = [];

            _.each(this.parentObjects, object => {
                if (object[this.linkStorageField]) {
                    if (this.metaFilters) {
                        const isValid = sift(this.metaFilters);
                        _.each(object[this.linkStorageField], object => {
                            if (isValid(object)) {
                                ids.push(object._id);
                            }
                        });
                    } else {
                        _.each(object[this.linkStorageField], object => {
                            ids.push(object._id);
                        });
                    }
                }
            });

            return {
                _id: {$in: _.uniq(ids)}
            };
        } else {
            let filters = {};
            if (this.metaFilters) {
                _.each(this.metaFilters, (value, key) => {
                    filters[key] = value;
                })
            }

            filters._id = {
                $in: _.uniq(
                    _.pluck(this.parentObjects, '_id')
                )
            };

            return {
                [this.linkStorageField]: {
                    $elemMatch: filters
                }
            };
        }
    }
}