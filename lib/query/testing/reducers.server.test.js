import { assert } from 'chai';
import { createQuery } from 'meteor/cultofcoders:grapher';
import Authors from './bootstrap/authors/collection';
import Comments from './bootstrap/comments/collection';

describe('Reducers', function () {
  it('Should work with field only reducers', async function () {
    const data = await createQuery({
      authors: {
        fullName: 1,
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isString(author.fullName);
      assert.isUndefined(author.name);
      assert.isTrue(author.fullName.substr(0, 7) === 'full - ');
    });
  });

  it('Should work with nested fields reducers', async function () {
    const data = await createQuery({
      authors: {
        fullNameNested: 1,
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isString(author.fullNameNested);
      assert.isString(author.fullNameNested);
      assert.isFalse(author.fullNameNested === 'undefined undefined');
      assert.isUndefined(author.profile);
    });
  });

  it('Should work with nested fields reducers - 2', async function () {
    const data = await createQuery({
      authors: {
        // reducer with {profile: {firstName: 1, lastName: 1}}
        fullNameNested: 1,
        profile: 1,
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isString(author.fullNameNested);
      assert.isString(author.fullNameNested);
      assert.isFalse(author.fullNameNested === 'undefined undefined');
      assert.isObject(author.profile);
      assert.isString(author.profile.firstName);
      assert.isString(author.profile.lastName);
    });
  });

  it('Should work with nested fields reducers - 3', async function () {
    const data = await createQuery({
      authors: {
        // reducer with {profile: 1}
        fullNameNested2: 1,
        profile: {
          firstName: 1,
        },
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isString(author.fullNameNested2);
      assert.isObject(author.profile);
      assert.isString(author.profile.firstName);
      // TODO: cleaning should be updated for this to work, currently this field is regular string
      // assert.isUndefined(author.profile.lastName);
    });
  });

  it('Should work with deep reducers', async function () {
    const data = await createQuery({
      posts: {
        $options: { limit: 5 },
        author: {
          fullName: 1,
          fullNameNested: 1,
        },
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((post) => {
      const author = post.author;
      assert.isUndefined(author.name);
      assert.isTrue(author.fullName.substr(0, 7) === 'full - ');
    });
  });

  it('Should work with nested fields reducers', async function () {
    const data = await createQuery({
      authors: {
        profile: {
          firstName: 1,
        },
        fullNameNested: 1,
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isString(author.fullNameNested);
      assert.isFalse(author.fullNameNested === 'undefined undefined');

      assert.isObject(author.profile);
      assert.isString(author.profile.firstName);
      assert.isUndefined(author.profile.lastName);
    });
  });

  it('Should work with links reducers', async function () {
    const data = await createQuery({
      authors: {
        groupNames: 1,
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isArray(author.groupNames);
      assert.isUndefined(author.groups);
    });
  });

  it('Should work with One link reducers', async function () {
    const sampleComment = await Comments.findOneAsync();

    const comment = await createQuery({
      comments: {
        $filters: {
          _id: sampleComment._id,
        },
        authorLinkReducer: 1,
      },
    }).fetchOneAsync();

    assert.isObject(comment);
    assert.isObject(comment.authorLinkReducer);
  });

  it('Should work with links and nested reducers', async function () {
    const data = await createQuery({
      authors: {
        referenceReducer: 1,
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isString(author.referenceReducer);
      assert.isUndefined(author.fullName);
      assert.isTrue(author.referenceReducer.substr(0, 9) === 'nested - ');
    });
  });

  it('Should not clean nested reducers if not specified', async function () {
    const data = await createQuery({
      authors: {
        referenceReducer: 1,
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isString(author.referenceReducer);
      assert.isUndefined(author.fullName);
      assert.isTrue(author.referenceReducer.substr(0, 9) === 'nested - ');
    });
  });

  it('Should not clean nested reducers if not specified', async function () {
    const data = await createQuery({
      authors: {
        referenceReducer: 1,
        fullName: 1,
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isString(author.referenceReducer);
      assert.isString(author.fullName);
    });
  });

  it('Should keep previously used items - Part 1', async function () {
    const data = await createQuery({
      authors: {
        fullName: 1,
        name: 1,
        groupNames: 1,
        groups: {
          name: 1,
        },
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isDefined(author.name);
      assert.isDefined(author.groups);
      assert.isArray(author.groupNames);
      assert.isString(author.fullName);
      assert.isTrue(author.fullName.substr(0, 7) === 'full - ');
    });
  });

  it('Should work with deep reducers', async function () {
    const data = await createQuery({
      posts: {
        $options: { limit: 5 },
        author: {
          fullName: 1,
          fullNameNested: 1,
        },
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((post) => {
      const author = post.author;
      assert.isUndefined(author.name);
      assert.isTrue(author.fullName.substr(0, 7) === 'full - ');
    });
  });

  it('Should keep previously used items - Part 2', async function () {
    const data = await createQuery({
      authors: {
        groupNames: 1,
        groups: {
          _id: 1,
        },
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isDefined(author.groups);
      assert.isArray(author.groupNames);

      author.groupNames.forEach((groupName) => {
        assert.isTrue(groupName.length > 2);
        assert.isTrue(groupName.substr(0, 2) == 'G#');
        assert.isFalse(groupName.slice(2) === 'undefined');
      });

      author.groups.forEach((group) => {
        assert.isDefined(group._id);
        assert.isUndefined(group.name);
      });
    });
  });

  it('Should work with params reducers', async function () {
    const query = createQuery({
      authors: {
        $options: { limit: 1 },
        paramBasedReducer: 1,
      },
    });

    query.setParams({
      element: 'TEST_STRING',
    });

    const data = await query.fetchAsync();

    assert.isTrue(data.length > 0);
    data.forEach((author) => {
      assert.equal(author.paramBasedReducer, 'TEST_STRING');
    });
  });

  it('Should work with reducers that use deep denormalized nested fields', async function () {
    /**
     * Both commentsReducers use Posts link on Authors collection and both use denormalized authorCached link
     * inside the Posts.
     *
     * This necessitates the use of embedReducerWithLink() function while creating reducers,
     * which was failing for denormalized fields and also for nested fields.
     *
     * Also, the commentsReducer2 uses nested item in the body, profile: {lastName: 1}
     */
    const query = createQuery({
      authors: {
        commentsReducer1: 1,
        commentsReducer2: 1,
      },
    });

    const data = await query.fetchAsync();

    assert.isTrue(data.length > 0);
    data.forEach((author) => {
      // check if nested denormalized links are working
      assert.isObject(author.commentsReducer2.author);
      assert.isTrue(author.commentsReducer2.author.name.startsWith('Author'));

      // check if nested fields are working
      assert.isObject(author.commentsReducer2.metadata);
      assert.isTrue(author.commentsReducer2.metadata.keywords.length > 0);
    });
  });

  it('Should allow non-existent nested fields while cleaning', async function () {
    const query = createQuery({
      posts: {
        reducerNonExistentNestedField: 1,
      },
    });

    const data = await query.fetchAsync({ limit: 1 });
    assert.equal(data[0].reducerNonExistentNestedField, 'null');
  });

  it('Should work with reducer expanders', async function () {
    const data = await createQuery({
      authors: {
        expandNameAndGroups: 1,
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isUndefined(author.expandNameAndGroups);
      assert.isString(author.name);
      assert.isArray(author.groups);

      author.groups.forEach((group) => {
        assert.isDefined(group._id);
        assert.isString(group.name);
      });
    });
  });

  it('Should work with reducer expanders and nested fields + graph-like query', async function () {
    const data = await createQuery({
      authors: {
        profile: {
          test: 1,
        },
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isUndefined(author.profile.test);
      assert.isString(author.profile.firstName);
      assert.isUndefined(author.profile.lastName);
    });
  });

  it('Should work with reducer expanders and nested fields + nested-like query', async function () {
    const data = await createQuery({
      authors: {
        'profile.test': 1,
      },
    }).fetchAsync();

    assert.isTrue(data.length > 0);

    data.forEach((author) => {
      assert.isUndefined(author.profile.test);
      assert.isString(author.profile.firstName);
      assert.isUndefined(author.profile.lastName);
    });
  });
});
