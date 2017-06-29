import applyFragments from '../lib/applyFragments';
import deepCompact from '../lib/deepCompact';
import mergeFragments from '../lib/mergeFragments';
import createQuery from '../../query/createQuery';

const FragmentComments = new Mongo.Collection('fragment_comments');
FragmentComments.attachSchema(new SimpleSchema({
    _id: { type: String },
    authorId: { type: String },
    title: { type: String },
    content: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String },
}));

const FragmentUsers = new Mongo.Collection('fragment_users');
FragmentUsers.attachSchema(new SimpleSchema({
    _id: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    picture: { type: String },
    secret_field: { type: String },
}));

FragmentComments.remove({});
FragmentUsers.remove({});

FragmentComments.insert({
    _id: 'comment1',
    authorId: 'user1',
    title: 'Title text here',
    content: 'Lorem ipsum',
    createdBy: 'user1',
    updatedBy: 'user1',
});

FragmentUsers.insert({
    _id: 'user1',
    first_name: 'John',
    last_name: 'Doe',
    picture: 'user1.png',
    secret_field: 'waffles',
});

FragmentComments.addLinks({
    author: {
        type: 'one',
        collection: FragmentUsers,
        field: 'authorId',
    },
});

FragmentComments.addFragments({
    publicFields: {
        _id: 1,
        author: {
            first_name: 1,
        },
        title: 1,
    },

    loggedInFields: {
        $composes: ['publicFields'],
        author: {
            last_name: 1,
        },
        content: 1,
    },

    metaFields: {
        createdBy: 1,
        updatedBy: 1,
    },

    secretFields: {
        author: {
            secret_field: 1,
        },
    },

    adminFields: {
        $composes: ['loggedInFields', 'metaFields', 'secretFields'],
    },

    allFields: {
        $composes: ['adminFields'],
        author: { },
    },

    nestedFragment: {
        _id: 1,
        author: {
            $fragments: ['authorFields'],
        },
        content: 1,
    },
});

FragmentUsers.addFragments({
    authorFields: {
        _id: 1,
        first_name: 1,
        last_name: 1,
    },
});

describe('Query fragments', function () {
    it('deepCompact removes falsy keys', function () {
        const object = {
            shallowOn: 1,
            shallowOff: 0,
            nested: {
                falsy: false,
                truthy: true,
            },
        };

        deepCompact(object);

        assert.deepEqual(object, {
            shallowOn: 1,
            nested: {
                truthy: true,
            },
        });
    });

    it('deepCompact does not remove empty objects supplied by the user', function () {
        const object = {
            shallow: 0,
            obj: { },
            shallowTrue: 1,
        };

        deepCompact(object);

        assert.deepEqual(object, {
            obj: { },
            shallowTrue: 1,
        });
    });

    it('deepCompact removes empty objects at the end', function () {
        const object = {
            shallow: 0,
            shallowTrue: 1,
            nested: {
                deep: 0,
            },
        };

        deepCompact(object);

        assert.deepEqual(object, {
            shallowTrue: 1,
        });
    });

    it('mergeFragments prioritizes empty objects', function () {
        const merged = mergeFragments({ key: { } }, { key: { subkey: 1 } });
        const mergedOpposite = mergeFragments({ key: { subkey: 1 } }, { key: { } });

        assert.deepEqual(merged, { key: { } });
        assert.deepEqual(mergedOpposite, { key: { } });
    });

    it('mergeFragments concats and dedupes $fragments lists', function () {
        const merged = mergeFragments({ $fragments: ['a', 'c'] }, { $fragments: ['b', 'c'] });

        assert.deepEqual(merged, {
            $fragments: ['a', 'c', 'b'],
        });
    });

    it('Compiles fragments with no dependencies', function () {
        const fragment = FragmentComments.getFragment('publicFields');
        const body = fragment.assemble();

        assert.deepEqual(body, {
            _id: 1,
            author: {
                first_name: 1,
            },
            title: 1,
        });
    });

    it('Compiles fragments with a dependency', function () {
        const fragment = FragmentComments.getFragment('loggedInFields');
        const body = fragment.assemble();

        assert.deepEqual(body, {
            _id: 1,
            author: {
                first_name: 1,
                last_name: 1,
            },
            content: 1,
            title: 1,
        });
    });

    it('Compiles fragments with multiple dependencies', function () {
        const fragment = FragmentComments.getFragment('adminFields');
        const body = fragment.assemble();

        assert.deepEqual(body, {
            _id: 1,
            author: {
                first_name: 1,
                last_name: 1,
                secret_field: 1,
            },
            content: 1,
            createdBy: 1,
            title: 1,
            updatedBy: 1,
        });
    });

    it('Respects empty object when merging fragments', function () {
        const fragment = FragmentComments.getFragment('allFields');
        const body = fragment.assemble();

        assert.deepEqual(body, {
            _id: 1,
            author: { },
            content: 1,
            createdBy: 1,
            title: 1,
            updatedBy: 1,
        });
    });

    it('Assembles query bodies with dependency-less fragments', function () {
        const body = {
            $fragments: ['publicFields'],
            author: {
                last_name: 1,
            },
        };

        const transformed = applyFragments(FragmentComments, body);

        assert.deepEqual(transformed, {
            _id: 1,
            author: {
                first_name: 1,
                last_name: 1,
            },
            title: 1,
        });
    });

    it('Assembles nested query bodies with nested fragments', function () {
        const body = {
            $fragments: ['nestedFragment'],
            title: 1,
        };

        const transformed = applyFragments(FragmentComments, body);

        assert.deepEqual(transformed, {
            _id: 1,
            author: {
                _id: 1,
                first_name: 1,
                last_name: 1,
            },
            content: 1,
            title: 1,
        });
    });

    it('Overrides assembled fragment if query has falsy values', function () {
        const body = {
            $fragments: ['publicFields'],
            title: 0,
        };

        const transformed = applyFragments(FragmentComments, body);

        assert.deepEqual(transformed, {
            _id: 1,
            author: {
                first_name: 1,
            },
        });
    });

    it('Fragments are applied to created queries', function () {
        const data = createQuery({
            fragment_comments: {
                $filters: { _id: 'comment1' },
                $fragments: ['publicFields'],
            },
        }).fetch();

        assert.lengthOf(data, 1);
        assert.deepEqual(data[0], {
            _id: 'comment1',
            author: {
                _id: 'user1',
                first_name: 'John',
            },
            title: 'Title text here',
        });
    });
});
