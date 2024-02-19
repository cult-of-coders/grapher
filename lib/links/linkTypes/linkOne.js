import Link from './base.js';
import SmartArgs from './lib/smartArguments.js';

export default class LinkOne extends Link {
  async set(what) {
    this._checkWhat(what);

    if (this.isVirtual) {
      await this._virtualAction('set', what);
      return this;
    }

    let field = this.linkStorageField;
    const _id = this.identifyId(what, true);
    await this._validateIds([_id]);

    this.object[field] = _id;

    await this.linker.mainCollection.updateAsync(this.object._id, {
      $set: {
        [field]: _id,
      },
    });

    return this;
  }

  async unset() {
    if (this.isVirtual) {
      await this._virtualAction('unset', what);
      return this;
    }

    let field = this.linkStorageField;
    this.object[field] = null;

    await this.linker.mainCollection.updateAsync(this.object._id, {
      $set: {
        [field]: null,
      },
    });

    return this;
  }

  async add(what) {
    this._checkWhat(what);

    if (this.isVirtual) {
      await this._virtualAction('add', what);
      return this;
    }

    throw new Meteor.Error(
      'invalid-command',
      'You are trying to *add* in a relationship that is single. Please use set/unset for *single* relationships',
    );
  }

  async remove(what) {
    this._checkWhat(what);

    if (this.isVirtual) {
      await this._virtualAction('remove', what);
      return this;
    }

    throw new Meteor.Error(
      'invalid-command',
      'You are trying to *remove* in a relationship that is single. Please use set/unset for *single* relationships',
    );
  }
}
