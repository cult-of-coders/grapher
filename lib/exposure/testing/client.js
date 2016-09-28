import Demo, {
    DemoMethod,
    DemoPublication
} from './bootstrap/demo.js';

describe('Exposure', function () {
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
            restrictedLink: 1
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
});
