import { assert } from 'chai';
import { Symbols } from '../lib/astToBody';

import astToQuery, {
  deny,
  createGetArgs,
  getMaxDepth,
} from '../lib/astToQuery';

describe('#astToQuery', function() {
  it('#createGetArgs', function() {
    const getArgs = createGetArgs({
      a: {
        [Symbols.ARGUMENTS]: { approved: false },
        b: {
          [Symbols.ARGUMENTS]: { approved: true },
          c: {
            [Symbols.ARGUMENTS]: { approved: true },
          },
          d: {},
        },
      },
    });

    assert.isFalse(getArgs('a').approved);
    assert.isTrue(getArgs('a.b').approved);
    assert.isTrue(getArgs('a.b.c').approved);
    assert.isTrue(Object.keys(getArgs('a.b.d')).length === 0);
  });
  it('#deny', function() {
    let body = {
      test: 1,
      testDeny: 1,
      nested: {
        testDeny: 1,
        testAllow: 1,
      },
      nestedEmpty: {
        disallow: 1,
      },
      nestedDeny: {
        a: 1,
        b: 1,
        c: 1,
      },
      heavy: {
        nest: {
          ting: {
            wup: {
              denyThis: 1,
            },
          },
        },
      },
    };

    deny(body, [
      'testDeny',
      'nested.testDeny',
      'nestedEmpty.disallow',
      'nestedDeny',
      'heavy.nest.ting.wup.denyThis',
    ]);

    assert.isDefined(body.test);
    assert.isUndefined(body.testDeny);
    assert.isDefined(body.nested.testAllow);
    assert.isUndefined(body.nested.testDeny);
    assert.isUndefined(body.nestedDeny);
    assert.isUndefined(body.heavy);
  });

  it('#getMaxDepth', function() {
    let body = {
      a: 1,
      b: 2,
    };

    assert.equal(getMaxDepth(body), 1);

    body = {
      a: {
        b: 1,
      },
      b: 1,
    };

    assert.equal(getMaxDepth(body), 2);

    body = {
      a: {
        b: 1,
        c: {
          d: {
            a: 1,
          },
        },
      },
      b: 1,
      c: {
        a: 1,
      },
    };

    assert.equal(getMaxDepth(body), 4);

    body = {
      a: {
        b: {
          c: {
            d: {
              e: {
                a: 1,
              },
            },
          },
        },
      },
      b: {
        c: {
          d: {
            e: {
              a: 1,
            },
          },
        },
      },
    };

    assert.equal(getMaxDepth(body), 6);
  });
});
