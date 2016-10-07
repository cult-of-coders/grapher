import { postList } from './bootstrap/server.js';
import { createQuery } from 'meteor/cultofcoders:grapher';

describe('Named Query', function () {
    it('Should return the proper values', function () {
        const createdQuery = createQuery({
            postList: {
                title: 'User Post - 3'
            }
        });

        const directQuery = postList.clone({
            title: 'User Post - 3'
        });

        _.each([createdQuery, directQuery], (query) => {
            const data = query.fetch();

            assert.isTrue(data.length > 1);

            _.each(data, post => {
                assert.equal(post.title, 'User Post - 3');
                assert.isObject(post.author);
                assert.isObject(post.group);
            })
        })
    });

    it('Exposure embodyment should work properly', function () {
        const query = createQuery({
            postListExposure: {
                title: 'User Post - 3'
            }
        });

        const data = query.fetch();

        assert.isTrue(data.length > 1);

        _.each(data, post => {
            assert.equal(post.title, 'User Post - 3');
            assert.isObject(post.author);
            assert.isObject(post.group);
        })
    })
});