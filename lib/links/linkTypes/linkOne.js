import Link from './base.js';

export default class LinkOne extends Link {
    get isSingle() { return true }

    applyFindFilters(filters) {
        filters._id = this.object[this.getLinkStorageField()];
    }

    applyFindFiltersForVirtual(filters) {
        filters[this.getLinkStorageField()] = this.object._id;
    }

    set(what) {
        if (this.isVirtual) throw new Meteor.Error('not-allowed', 'Set/Unset operations should be done from the owner of the relationship');

        let field = this.getLinkStorageField();
        let _id = this._identity(what);

        this.object[field] = _id;

        this.linker.mainCollection.update(this.object._id, {
            $set: {
                [field]: _id
            }
        });
    }

    unset() {
        if (this.isVirtual) throw new Meteor.Error('not-allowed', 'Set/Unset operations should be done from the owner of the relationship');

        let field = this.getLinkStorageField();
        this.object[field] = null;

        this.linker.mainCollection.update(this.object._id, {
            $set: {
                [field]: null
            }
        });
    }

    add() {
        throw new Meteor.Error('invalid-command', 'You are trying to *add* in a relationship that is single. Please use set/unset for *single* relationships');
    }

    remove() {
        throw new Meteor.Error('invalid-command', 'You are trying to *remove* in a relationship that is single. Please use set/unset for *single* relationships');
    }
}