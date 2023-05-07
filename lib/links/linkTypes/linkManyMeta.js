import Link from './base.js';
import SmartArgs from './lib/smartArguments.js';

export default class LinkManyMeta extends Link {
    clean() {
        if (!this.object[this.linkStorageField]) {
            this.object[this.linkStorageField] = [];
        }
    }

    /**
     * @param what
     * @param metadata
     */
    add(what, metadata = {}) {
        this._checkWhat(what);

        if (this.isVirtual) {
            this._virtualAction('add', what, metadata);
            return this;
        }

        const _ids = this.identifyIds(what, true);
        this._validateIds(_ids);

        let field = this.linkStorageField;

        this.object[field] = this.object[field] || [];
        let metadatas = [];

        _.each(_ids, _id => {
            let localMetadata = _.clone(metadata);
            localMetadata._id = _id;

            this.object[field].push(localMetadata);
            metadatas.push(localMetadata);
        });

        let modifier = {
            $addToSet: {
                [field]: {$each: metadatas}
            }
        };

        this.linker.mainCollection.update(this.object._id, modifier);

        return this;
    }

    /**
     * @param what
     * @param extendMetadata
     */
    metadata(what, extendMetadata) {
        if (this.isVirtual) {
            this._virtualAction('metadata', what, extendMetadata);

            return this;
        }

        let field = this.linkStorageField;

        if (what === undefined) {
            return this.object[field];
        }

        if (Array.isArray(what)) {
            throw new Meteor.Error('not-allowed', 'Metadata updates should be made for one entity only, not multiple');
        }

        const _id = this.identifyId(what);

        let existingMetadata = _.find(this.object[field], metadata => metadata._id == _id);
        if (extendMetadata === undefined) {
            return existingMetadata;
        } else {
            _.extend(existingMetadata, extendMetadata);
            let subfield = field + '._id';
            let subfieldUpdate = field + '.$';

            this.linker.mainCollection.update({
                _id: this.object._id,
                [subfield]: _id
            }, {
               $set: {
                   [subfieldUpdate]: existingMetadata
               }
            });
        }

        return this;
    }

    remove(what) {
        this._checkWhat(what);

        if (this.isVirtual) {
            this._virtualAction('remove', what);
            return this;
        }

        const _ids = this.identifyIds(what);
        let field = this.linkStorageField;

        this.object[field] = _.filter(this.object[field], link => !_.contains(_ids, link._id));

        let modifier = {
            $pull: {
                [field]: {
                    _id: {
                        $in: _ids
                    }
                }
            }
        };

        this.linker.mainCollection.update(this.object._id, modifier);

        return this;
    }

    set(what, metadata) {
        this._checkWhat(what);

        if (this.isVirtual) {
            this._virtualAction('set', what, metadata);
            return this;
        }

        throw new Meteor.Error('invalid-command', 'You are trying to *set* in a relationship that is single. Please use add/remove for *many* relationships');
    }

    unset(what) {
        this._checkWhat(what);

        if (this.isVirtual) {
            this._virtualAction('unset', what);
            return this;
        }

        throw new Meteor.Error('invalid-command', 'You are trying to *unset* in a relationship that is single. Please use add/remove for *many* relationships');
    }
}
