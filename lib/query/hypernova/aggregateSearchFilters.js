export default class AggregateFilters {
    constructor(collectionNode) {
        this.collectionNode = collectionNode;
        this.linker = collectionNode.linker;

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
                    $in: _.pluck(this.parentObjects, this.linkStorageField)
                }
            };
        } else {
            return {
                [this.linkStorageField]: {
                    $in: _.pluck(this.parentObjects, '_id')
                }
            };
        }
    }

    createOneMeta() {
        if (!this.isVirtual) {
            return {
                _id: {
                    $in: _.pluck(
                        _.pluck(this.parentObjects, this.linkStorageField),
                        '_id'
                    )
                }
            };
        } else {
            const field = this.linkStorageField + '._id';
            return {
                [field]: {
                    $in: _.pluck(this.parentObjects, '_id')
                }
            };
        }
    }

    createMany() {
        if (!this.isVirtual) {
            const arrayOfIds = _.pluck(this.parentObjects, this.linkStorageField);
            return {
                _id: {
                    $in: _.union(...arrayOfIds)
                }
            };
        } else {
            const arrayOfIds = _.pluck(this.parentObjects, '_id');
            return {
                [this.linkStorageField]: {
                    $in: _.union(...arrayOfIds)
                }
            };
        }
    }

    createManyMeta() {
        if (!this.isVirtual) {
            let ids = [];
            _.each(this.parentObjects, object => {
                if (object[this.linkStorageField]) {
                    let localIds = _.pluck(object[this.linkStorageField], '_id');
                    ids = _.union(ids, ...localIds);
                }
            });

            return {
                _id: {$in: ids}
            };
        } else {
            const field = this.linkStorageField + '._id';
            return {
                [field]: {
                    $in: _.pluck(this.parentObjects, '_id')
                }
            };
        }
    }
}