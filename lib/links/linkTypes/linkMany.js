import Link from './base.js';
import dot from 'dot-object';
import { _ } from 'meteor/underscore';

export default class LinkMany extends Link {
  clean() {
    if (!this.object[this.linkStorageField]) {
      this.object[this.linkStorageField] = [];
    }
  }

  /**
   * Ads the _ids to the object.
   * @param {Grapher.IdOption} what
   */
  async add(what) {
    this._checkWhat(what);

    if (this.isVirtual) {
      await this._virtualAction('add', what);
      return this;
    }

    //if (this.isVirtual) throw new Meteor.Error('not-allowed', 'Add/remove operations must be done from the owning-link of the relationship');

    this.clean();

    const _ids = await this.identifyIds(what, true);
    await this._validateIds(_ids);

    const field = this.linkStorageField;

    // update the field
    this.object[field] = _.union(this.object[field], _ids);

    // update the db
    let modifier = {
      $addToSet: {
        [field]: { $each: _ids },
      },
    };

    await this.linker.mainCollection.updateAsync(this.object._id, modifier);

    return this;
  }

  /**
   * @param {unknown} what
   */
  async remove(what) {
    this._checkWhat(what);

    if (this.isVirtual) {
      await this._virtualAction('remove', what);
      return this;
    }

    if (this.isVirtual)
      throw new Meteor.Error(
        'not-allowed',
        'Add/Remove operations should be done from the owner of the relationship',
      );

    this.clean();

    const field = this.linkStorageField;
    const [root, ...nested] = field.split('.');

    const _ids = await this.identifyIds(what);

    // update the field
    this.object[root] = _.filter(
      this.object[root],
      (_id) =>
        !_.contains(
          _ids,
          nested.length > 0 ? dot.pick(nested.join('.'), _id) : _id,
        ),
    );

    let modifier;
    if (this.linker.foreignIdentityField === '_id') {
      // update the db
      modifier = {
        $pullAll: {
          [root]: nested.length > 0 ? { [nested.join('.')]: _ids } : _ids,
        },
      };
    } else {
      modifier = {
        $unset: { [root]: 1 },
      };
    }

    await this.linker.mainCollection.updateAsync(this.object._id, modifier);

    return this;
  }

  /**
   *
   * @param {Grapher.IdOption} what
   * @returns
   */
  async set(what) {
    this._checkWhat(what);

    if (this.isVirtual) {
      await this._virtualAction('set', what);
      return this;
    }

    throw new Meteor.Error(
      'invalid-command',
      'You are trying to *set* in a relationship that is many. Please use add/remove for *many* relationships',
    );
  }

  /**
   *
   * @param {Grapher.IdOption} what
   * @returns
   */
  unset(what) {
    this._checkWhat(what);

    if (this.isVirtual) {
      this._virtualAction('unset', what);
      return this;
    }

    throw new Meteor.Error(
      'invalid-command',
      'You are trying to *unset* in a relationship that is many. Please use add/remove for *many* relationships',
    );
  }
}
