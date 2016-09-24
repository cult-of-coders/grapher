import Demo from './bootstrap/demo.js';

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

            }
        });

        query.fetch((err, res) => {
            assert.isUndefined(res);
            assert.isDefined(err);

            done();
        });
    })
});
