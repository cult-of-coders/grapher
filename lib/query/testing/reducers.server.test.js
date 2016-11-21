import { createQuery } from 'meteor/cultofcoders:grapher';

describe('Reducers', function () {
    it('Should work with field only reducers', function () {
        const data = createQuery({
            authors: {
                fullName: 1
            }
        }).fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isString(author.fullName);
            assert.isUndefined(author.name);
            assert.isTrue(author.fullName.substr(0, 7) === 'full - ')
        })
    });

    it('Should work with nested fields reducers', function () {
        const data = createQuery({
            authors: {
                fullNameNested: 1
            }
        }).fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isString(author.fullNameNested);
            assert.isString(author.fullNameNested);
            assert.isFalse(author.fullNameNested === 'undefined undefined');
            assert.isUndefined(author.profile);
        })
    });

    it('Should work with nested fields reducers', function () {
        const data = createQuery({
            authors: {
                profile: {
                    firstName: 1
                },
                fullNameNested: 1,
            }
        }).fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isString(author.fullNameNested);
            assert.isFalse(author.fullNameNested === 'undefined undefined');

            assert.isObject(author.profile);
            assert.isString(author.profile.firstName);
            assert.isUndefined(author.profile.lastName);
        })
    });

    it('Should work with links reducers', function () {
        const data = createQuery({
            authors: {
                groupNames: 1
            }
        }).fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isArray(author.groupNames);
            assert.isUndefined(author.groups);
        })
    });

    it('Should work with links and nested reducers', function () {
        const data = createQuery({
            authors: {
                referenceReducer: 1
            }
        }).fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isString(author.referenceReducer);
            assert.isUndefined(author.fullName);
            assert.isTrue(author.referenceReducer.substr(0, 9) === 'nested - ')
        })
    });

    it('Should not clean nested reducers if not specified', function () {
        const data = createQuery({
            authors: {
                referenceReducer: 1,
                fullName: 1,
            }
        }).fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isString(author.referenceReducer);
            assert.isString(author.fullName);
        })
    });

    it('Should keep previously used items - Part 1', function () {
        const data = createQuery({
            authors: {
                fullName: 1,
                name: 1,
                groupNames: 1,
                groups: {
                    name: 1
                }
            }
        }).fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isDefined(author.name);
            assert.isDefined(author.groups);
            assert.isArray(author.groupNames);
            assert.isString(author.fullName);
            assert.isTrue(author.fullName.substr(0, 7) === 'full - ')
        })
    });

    it('Should keep previously used items - Part 2', function () {
        const data = createQuery({
            authors: {
                groupNames: 1,
                groups: {
                    _id: 1
                }
            }
        }).fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isDefined(author.groups);
            assert.isArray(author.groupNames);

            author.groupNames.forEach(groupName => {
                assert.isTrue(groupName.length > 2);
                assert.isTrue(groupName.substr(0, 2) == 'G#');
                assert.isFalse(groupName.slice(2) === 'undefined');
            });

            author.groups.forEach(group => {
                assert.isDefined(group._id);
                assert.isUndefined(group.name);
            })
        })
    });
});