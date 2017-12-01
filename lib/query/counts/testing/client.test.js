import { Tracker } from 'meteor/tracker';
import PostsCollection from './bootstrap/collection.test';
import NamedQuery from './bootstrap/namedQuery.test';

describe('Reactive count tests', function () {
    it('Should fetch the initial count', function (done) {
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
    it('Should update when a document is added', function (done) {
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

    it('Should update when a document is removed', function (done) {
        const query = NamedQuery.clone();
        const handle = query.subscribeCount();

        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();
                const count = query.getCount();
                assert.equal(count, 3);

                Meteor.call('removePost', 'removeid', (error) => {
                    const newCount = query.getCount();
                    assert.equal(newCount, 2);

                    handle.stop();
                    done();
                });
            }
        });
    });
});
