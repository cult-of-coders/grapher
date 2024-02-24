import { _ } from 'meteor/underscore';
import Link from './base.js';

export default class LinkOneMeta extends Link {
  /**
   * @param {Grapher.IdSingleOption} what
   * @param {unknown} metadata
   * @returns
   */
  async set(what, metadata = {}) {
    this._checkWhat(what);

    metadata = Object.assign({}, metadata);

    if (this.isVirtual) {
      await this._virtualAction('set', what, metadata);
      return this;
    }

    let field = this.linkStorageField;
    metadata._id = await this.identifyId(what, true);
    await this._validateIds([metadata._id]);

    this.object[field] = metadata;

    await this.linker.mainCollection.updateAsync(this.object._id, {
      $set: {
        [field]: metadata,
      },
    });

    return this;
  }

  async metadata(extendMetadata) {
    if (this.isVirtual) {
      await this._virtualAction('metadata', undefined, extendMetadata);
      return this;
    }

    let field = this.linkStorageField;

    if (!extendMetadata) {
      return this.object[field];
    } else {
      _.extend(this.object[field], extendMetadata);

      await this.linker.mainCollection.updateAsync(this.object._id, {
        $set: {
          [field]: this.object[field],
        },
      });
    }

    return this;
  }

  async unset() {
    if (this.isVirtual) {
      await this._virtualAction('unset');
      return this;
    }

    let field = this.linkStorageField;
    this.object[field] = {};

    await this.linker.mainCollection.updateAsync(this.object._id, {
      $set: {
        [field]: {},
      },
    });

    return this;
  }

  /**
   *
   * @param {Grapher.IdOption} what
   * @param {unknown} metadata
   * @returns
   */
  async add(what, metadata) {
    this._checkWhat(what);

    if (this.isVirtual) {
      await this._virtualAction('add', what, metadata);
      return this;
    }

    throw new Meteor.Error(
      'invalid-command',
      'You are trying to *add* in a relationship that is single. Please use set/unset for *single* relationships',
    );
  }

  /**
   *
   * @param {Grapher.IdOption} what
   * @returns
   */
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
