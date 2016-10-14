import deepClone from '../../lib/deepClone';

describe('Test deepClone function', function () {
    it('should clone a simple object', function () {
        let myObject = {
            a: 1,
            b: 2,
            c: {
                c1: 1,
                c2: 2,
                c3: {
                    c31: 1,
                    c32: 2
                }
            },
            d: [
                {
                    d1: 1,
                    d2: 2
                }
            ]
        };

        const runAssertions = (object) => {
            assert.equal(object.a, 1);
            assert.equal(object.b, 2);
            assert.equal(object.c.c1, 1);
            assert.equal(object.c.c2, 2);
            assert.equal(object.c.c3.c31, 1);
            assert.equal(object.c.c3.c32, 2);
            assert.equal(object.d[0].d1, 1);
            assert.equal(object.d[0].d2, 2);
        };

        let clone = deepClone(myObject);

        runAssertions(clone);

        clone.a = 2;
        clone.b = 3;
        clone.c.c1 = 2;
        clone.c.c2 = 3;
        clone.c.c3.c31 = 2;
        clone.c.c3.c32 = 3;
        clone.d[0].d1 = 2;
        clone.d[0].d2 = 3;

        runAssertions(myObject);
    })
});