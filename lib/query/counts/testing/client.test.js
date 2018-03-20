import { Tracker } from 'meteor/tracker';
import PostsCollection from './bootstrap/collection.test';
import NamedQuery, {
    postsQuery,
    postsQuery2,
} from './bootstrap/namedQuery.test';

describe('Reactive count tests', function() {
    it('Should fetch the initial count', function(done) {
        const query = NamedQuery.clone();
        const handle = query.subscribeCount();

        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();
                const count = query.getCount();
                handle.stop();

                assert.equal(count, 3);
                done();
            }
        });
    });

    // TODO: Can these tests fail if assert gets called too quickly?
    it('Should update when a document is added', function(done) {
        const query = NamedQuery.clone();
        const handle = query.subscribeCount();

        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();
                const count = query.getCount();
                assert.equal(count, 3);

                Meteor.call('addPost', 'text4', (error, newId) => {
                    const newCount = query.getCount();
                    assert.equal(newCount, 4);

                    Meteor.call('removePost', newId);
                    handle.stop();
                    done();
                });
            }
        });
    });

    it('Should update when a document is removed', function(done) {
        const query = NamedQuery.clone();
        const handle = query.subscribeCount();

        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();
                const count = query.getCount();
                assert.equal(count, 3);

                Meteor.call('removePost', 'removeid', error => {
                    const newCount = query.getCount();
                    assert.equal(newCount, 2);

                    handle.stop();
                    done();
                });
            }
        });
    });

    it('Should work with two different queries', function(done) {
        const query1 = postsQuery.clone();
        const query2 = postsQuery2.clone();

        const handle2 = query2.subscribeCount();
        const handle1 = query1.subscribeCount();

        Tracker.autorun(c => {
            if (handle1.ready() && handle2.ready()) {
                const count1 = query1.getCount();
                const count2 = query2.getCount();

                console.log(count1, count2);

                assert.equal(count1, 3);
                assert.equal(count2, 1);
                done();
            }
        });
    });
});
