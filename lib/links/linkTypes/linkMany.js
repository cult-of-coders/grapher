import Link from './base.js';
import SmartArgs from './lib/smartArguments.js';

export default class LinkMany extends Link {
    clean() {
        if (!this.object[this.getLinkStorageField()]) {
            this.object[this.getLinkStorageField()] = [];
        }
    }

    /**
     * @param filters
     */
    applyFindFilters(filters) {
        filters._id = {$in: this.object[this.getLinkStorageField()]};
    }

    /**
     * @param filters
     */
    applyFindFiltersForVirtual(filters) {
        filters[this.getLinkStorageField()] = {$in: [this.object._id]};
    }

    /**
     * Ads the _ids to the object.
     * @param what
     */
    add(what) {
        if (this.isVirtual) throw new Meteor.Error('not-allowed', 'Add/remove operations must be done from the owning-link of the relationship');
        this.clean();

        const _ids = this.identifyIds(what, true);
        const field = this.getLinkStorageField();

        // update the field
        this.object[field] = _.union(this.object[field], _ids);

        // update the db
        let modifier = {
            $addToSet: {
                [field]: {$each: _ids}
            }
        };

        this.linker.mainCollection.update(this.object._id, modifier);

        return this;
    }

    /**
     * @param what
     */
    remove(what) {
        if (this.isVirtual) throw new Meteor.Error('not-allowed', 'Add/Remove operations should be done from the owner of the relationship');

        this.clean();
        const field = this.getLinkStorageField();

        const _ids = this.identifyIds(what);

        // update the field
        this.object[field] = _.filter(this.object[field], _id => !_.contains(_ids, _id));

        // update the db
        let modifier = {
            $pullAll: {
                [field]: _ids
            }
        };

        this.linker.mainCollection.update(this.object._id, modifier);

        return this;
    }

    set() {
        throw new Meteor.Error('invalid-command', 'You are trying to *set* in a relationship that is single. Please use add/remove for *many* relationships');
    }

    unset() {
        throw new Meteor.Error('invalid-command', 'You are trying to *unset* in a relationship that is single. Please use add/remove for *many* relationships');
    }
}