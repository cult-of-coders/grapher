import { assert } from 'chai';
import { createQuery } from 'meteor/cultofcoders:grapher';
import waitForHandleToBeReady from './lib/waitForHandleToBeReady';

describe('Client-side reducers', function() {
    it('Should work with field only reducers', async function() {
        const query = createQuery({
            authors: {
                fullName: 1,
            },
        });

        let handle = query.subscribe();
        await waitForHandleToBeReady(handle);
        const data = query.fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isString(author.fullName);
            assert.isUndefined(author.name);
            assert.isTrue(author.fullName.substr(0, 7) === 'full - ');
        });

        handle.stop();
    });

    it('Should work with field only reducers and parameters', async function() {
        const query = createQuery({
            authors: {
                fullName: 1,
            },
        });

        query.setParams({
            suffix: 'Bomb',
        });

        let handle = query.subscribe();
        await waitForHandleToBeReady(handle);
        const data = query.fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isString(author.fullName);
            assert.isUndefined(author.name);
            assert.isTrue(author.fullName.indexOf('Bomb') >= 0);
        });

        handle.stop();
    });

    it('Should work with nested fields reducers', async function() {
        const query = createQuery({
            authors: {
                fullNameNested: 1,
            },
        });

        let handle = query.subscribe();
        await waitForHandleToBeReady(handle);
        const data = query.fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isString(author.fullNameNested);
            assert.isString(author.fullNameNested);
            assert.isFalse(author.fullNameNested === 'undefined undefined');
            assert.isUndefined(author.profile);
        });

        handle.stop();
    });

    it('Should work with nested fields reducers', async function() {
        const query = createQuery({
            authors: {
                profile: {
                    firstName: 1,
                },
                fullNameNested: 1,
            },
        });

        let handle = query.subscribe();
        await waitForHandleToBeReady(handle);
        const data = query.fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isString(author.fullNameNested);
            assert.isFalse(author.fullNameNested === 'undefined undefined');

            assert.isObject(author.profile);
            assert.isString(author.profile.firstName);
            assert.isUndefined(author.profile.lastName);
        });

        handle.stop();
    });

    it('Should work with links reducers', async function() {
        const query = createQuery({
            authors: {
                groupNames: 1,
            },
        });

        let handle = query.subscribe();
        await waitForHandleToBeReady(handle);
        const data = query.fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isArray(author.groupNames);
            assert.isUndefined(author.groups);
        });

        handle.stop();
    });

    it('Should work with links and nested reducers', async function() {
        const query = createQuery({
            authors: {
                referenceReducer: 1,
            },
        });

        let handle = query.subscribe();
        await waitForHandleToBeReady(handle);
        const data = query.fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isString(author.referenceReducer);
            assert.isUndefined(author.fullName);
            assert.isTrue(author.referenceReducer.substr(0, 9) === 'nested - ');
        });

        handle.stop();
    });

    it('Should not clean nested reducers if not specified', async function() {
        const query = createQuery({
            authors: {
                referenceReducer: 1,
                fullName: 1,
            },
        });

        let handle = query.subscribe();
        await waitForHandleToBeReady(handle);
        const data = query.fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isString(author.referenceReducer);
            assert.isString(author.fullName);
        });

        handle.stop();
    });

    it('Should keep previously used items - Part 1', async function() {
        const query = createQuery({
            authors: {
                fullName: 1,
                name: 1,
                groupNames: 1,
                groups: {
                    name: 1,
                },
            },
        });

        let handle = query.subscribe();
        await waitForHandleToBeReady(handle);
        const data = query.fetch();

        assert.isTrue(data.length > 0);

        data.forEach(author => {
            assert.isDefined(author.name);
            assert.isDefined(author.groups);
            assert.isArray(author.groupNames);
            assert.isString(author.fullName);
            assert.isTrue(author.fullName.substr(0, 7) === 'full - ');
        });

        handle.stop();
    });

    it('Should keep previously used items - Part 2', async function() {
        const query = createQuery({
            authors: {
                groupNames: 1,
                groups: {
                    _id: 1,
                    name: 1,
                },
            },
        });

        let handle = query.subscribe();
        await waitForHandleToBeReady(handle);
        const data = query.fetch();

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
                assert.isDefined(group.name);
            });
        });

        handle.stop();
    });

    it('Should work with denormalized fields', async function() {
        const query = createQuery({
            groups: {
                posts: {
                    authorCached: {
                        name: 1,
                    }
                },
            }
        });

        let handle = query.subscribe();
        await waitForHandleToBeReady(handle);
        const data = query.fetch();

        assert.isTrue(data.length > 0);

        data.forEach(data => {
            data.posts.forEach(post => {
                assert.isObject(post.authorCached);
                assert.isDefined(post.authorCached.name);
        
    
                // denormalized field should not be present
                assert.isUndefined(post.authorCache);
            });
        });

        handle.stop();
    });
});
