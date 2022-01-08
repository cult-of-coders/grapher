import Link from './base.js';
import dot from 'dot-object';
import SmartArgs from './lib/smartArguments.js';

export default class LinkMany extends Link {
    clean() {
        if (!this.object[this.linkStorageField]) {
            this.object[this.linkStorageField] = [];
        }
    }

    /**
     * Ads the _ids to the object.
     * @param what
     */
    add(what) {
        this._checkWhat(what);

        if (this.isVirtual) {
            this._virtualAction('add', what);
            return this;
        }

        //if (this.isVirtual) throw new Meteor.Error('not-allowed', 'Add/remove operations must be done from the owning-link of the relationship');

        this.clean();

        const _ids = this.identifyIds(what, true);
        this._validateIds(_ids);

        const field = this.linkStorageField;

        // update the field
        this.object[field] = _.union(this.object[field], _ids);

        // update the db
        const item = this.linker.mainCollection.findOne( this.object._id );

        // Monkey patch : While the $addToSet seems broken, let's do the job ourself !
        /*
        let modifier = {
            $addToSet: {
                [field]: {$each: _ids}
            }
        };
        */
        this.linker.mainCollection.update
        (
            this.object._id
            , {
                $set: {
                    [field]: ! item[ field ]
                             ? _ids
                             : _.union( item[ field ], _ids )
                }
            }
        );

        return this;
    }

    /**
     * @param what
     */
    remove(what) {
        this._checkWhat(what);

        if (this.isVirtual) {
            this._virtualAction('remove', what);
            return this;
        }

        if (this.isVirtual) throw new Meteor.Error('not-allowed', 'Add/Remove operations should be done from the owner of the relationship');

        this.clean();
        const field = this.linkStorageField;
        const [root, ...nested] = field.split('.');

        const _ids = this.identifyIds(what);

        // update the field
        this.object[root] 
            = _.filter
            (
                this.object[root]
                , _id => 
                (
                    !_.contains
                    (
                        _ids
                        , nested.length > 0 
                            ? dot.pick(nested.join('.'), _id) 
                            : _id
                    )
                )
        );

        const item = this.linker.mainCollection.findOne( this.object._id );

        // update the db
        // Monkey patch : While the $pullAll seems broken, let's do the job ourself !
        /* let modifier = {
            $pullAll: {
                [root]: nested.length > 0 ? { [nested.join('.')]: _ids } : _ids,
            },
        };
        */
        const toKeep = _.without( item[ field ], ..._ids );
        this.linker.mainCollection.update
        (
            this.object._id
            , {
                $set: 
                {
                    [root]: nested.length > 0 
                            ? { [nested.join('.')]: toKeep } 
                            : toKeep,
                }
            }
        );

        return this;
    }

    set(what) {
        this._checkWhat(what);

        if (this.isVirtual) {
            this._virtualAction('set', what);
            return this;
        }

        throw new Meteor.Error('invalid-command', 'You are trying to *set* in a relationship that is many. Please use add/remove for *many* relationships');
    }

    unset(what) {
        this._checkWhat(what);

        if (this.isVirtual) {
            this._virtualAction('unset', what);
            return this;
        }

        throw new Meteor.Error('invalid-command', 'You are trying to *unset* in a relationship that is many. Please use add/remove for *many* relationships');
    }
}

