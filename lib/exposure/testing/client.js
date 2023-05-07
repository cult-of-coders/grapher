import { assert } from 'chai';
import Demo, {
    DemoMethod,
    DemoPublication
} from './bootstrap/demo.js';

import Intersect, { CollectionLink as IntersectLink } from './bootstrap/intersect';

describe('Exposure Tests', function () {
    it('Should fetch only allowed data and limitations should be applied', function (done) {
        const query = Demo.createQuery({
            $options: {limit: 3},
            restrictedField: 1
        });

        query.fetch((err, res) => {
            assert.isUndefined(err);
            assert.isDefined(res);

            assert.lengthOf(res, 2);
            done();
        });
    });

    it('Should not allow me to fetch the graph data, because of maxDepth', function (done) {
        const query = Demo.createQuery({
            $options: {limit: 3},
            restrictedField: 1,
            children: {
                myself: {

                }
            }
        });

        query.fetch((err, res) => {
            assert.isUndefined(res);
            assert.isDefined(err);

            done();
        });
    });

    it('Should return the correct count', function (done) {
        Meteor.call('exposure_exposure_test.count', {}, function (err, res) {
            assert.isUndefined(err);

            assert.equal(3, res);
            done();
        })
    });

    it('Should return the correct count via query', function (done) {
        const query = Demo.createQuery({
            $options: {limit: 1}
        });

        query.getCount(function (err, res) {
            assert.isUndefined(err);

            assert.equal(3, res);
            done();
        })
    });
    it('Should return the correct count when querying with filters on date objects', function (done) {
        const query = Demo.createQuery({
            $filters: {date: {$lte: new Date()}},
            date: 1
        });

        query.getCount(function (err, res) {
            assert.isUndefined(err);

            assert.equal(1, res);
            done();
        })
    });

    it('Should should not allow publish but only method', function (done) {
        const query = DemoMethod.createQuery({
            _id: 1
        });

        query.fetch((err, res) => {
            assert.isUndefined(err);
            assert.isDefined(res);
        });

        const handler = query.subscribe({
            onStop(e) {
                done();
            }
        });
    });

    it('Should should not allow method but only publish', function (done) {
        const query = DemoPublication.createQuery({
            _id: 1
        });

        query.fetch((err, res) => {
            assert.isDefined(err);
            assert.isUndefined(res);
        });

        query.subscribe({
            onReady() {
                done();
            }
        });
    });


    it('Should restrict links # restrictLinks ', function (done) {
        const query = Demo.createQuery({
            _id: 1,
            restrictedLink: {}
        });

        query.fetch((err, res) => {
            assert.isUndefined(err);

            _.each(res, item => {
                assert.isUndefined(item.restrictedLink)
            });

            assert.isArray(res);
            assert.isFalse(res.length === 0);

            done();
        });
    });

    it('Should intersect the body graphs - Method', function (done) {
        const query = Intersect.createQuery({
            $filters: {
                value: 'Hello'
            },
            value: 1,
            privateValue: 1,
            link: {
                value: 1,
                privateValue: 1,
                myself: {
                    value: 1
                }
            },
            privateLink: {
                value: 1,
                privateValue: 1
            }
        });

        query.fetch((err, res) => {
            assert.isUndefined(err);
            assert.lengthOf(res, 1);

            const result = _.first(res);

            assert.isDefined(result.value);
            assert.isUndefined(result.privateValue);
            assert.isUndefined(result.privateLink);

            assert.isObject(result.link);
            assert.isDefined(result.link.value);
            assert.isUndefined(result.link.privateValue);
            assert.isUndefined(result.link.myself);

            done();
        });
    });

    it('Should intersect the body graphs - Subscription', function (done) {
        const query = Intersect.createQuery({
            $filters: {
                value: 'Hello'
            },
            value: 1,
            privateValue: 1,
            link: {
                value: 1,
                privateValue: 1,
                myself: {
                    value: 1
                }
            },
            privateLink: {
                value: 1,
                privateValue: 1
            }
        });

        const handle = query.subscribe();

        Tracker.autorun((c) => {
            if (handle.ready()) {
                c.stop();
                const res = query.fetch();

                assert.lengthOf(res, 1);

                const result = _.first(res);

                assert.isDefined(result.value);
                assert.isUndefined(result.privateValue);
                assert.isUndefined(result.privateLink);

                assert.isObject(result.link);
                assert.isDefined(result.link.value);
                assert.isUndefined(result.link.privateValue);
                assert.isUndefined(result.link.myself);

                done();
            }
        });
    })
});
