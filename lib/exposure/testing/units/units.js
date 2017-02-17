import restrictFields from '../../lib/restrictFields.js';
import enforceMaxLimit from '../../lib/enforceMaxLimit.js';
import cleanBody from '../../lib/cleanBody.js';
import { cleanOptions, cleanFilters } from '../../lib/cleanSelectors.js';
import enforceMaxDepth, {getDepth} from '../../lib/enforceMaxDepth.js';
import CollectionNode from '../../../query/nodes/collectionNode.js';

describe('Unit Tests', function () {
    it('Should be able to restrict fields', function () {
        let filters = {
            test: 1,
            shouldRestrict: 1,
            'shouldRestrict.this': 1,
            shouldRestrict2: 1,
            $and: [{
                shouldRestrict: 1,
                'shouldRestrict.this': 1,
                test: 1,
            }, {
                test: 1,
                shouldRestrict: 1,
                'shouldRestrict.this': 1
            }],
            $or: [{
                $and: [{
                    test: 1,
                    shouldRestrict: 1,
                    'shouldRestrict.this': 1
                }]
            }],
            $nor: [{
                test: 1,
                shouldRestrict: 1,
                'shouldRestrict.this': 1
            }],
            $not: {
                test: 1,
                shouldRestrict: 1,
                'shouldRestrict.this': 1
            }
        };

        let options = {
            sort: {
                test: 1,
                shouldRestrict: 1,
                shouldRestrict2: 1,
                'shouldRestrict.this': 1
            },
            fields: {
                test: 1,
                shouldRestrict: 1,
                shouldRestrict2: 1,
                'shouldRestrict.this': 1
            }
        };

        restrictFields(filters, options, ['shouldRestrict', 'shouldRestrict2']);

        assert.lengthOf(_.keys(filters), 5);
        assert.equal(filters.test, 1);
        assert.isUndefined(filters.shouldRestrict);
        assert.isUndefined(filters['shouldRestrict.this']);

        assert.lengthOf(_.keys(options.sort), 1);
        assert.equal(options.sort.test, 1);
        assert.isUndefined(options.sort.shouldRestrict, 1);
        assert.isUndefined(options.sort['shouldRestrict.this']);

        assert.lengthOf(_.keys(options.fields), 1);
        assert.equal(options.fields.test, 1);
        assert.isUndefined(options.fields['shouldRestrict.this']);
        assert.isUndefined(options.fields['shouldRestrict']);

        assert.isDefined(filters.$not.test);
        assert.isUndefined(filters.$not.shouldRestrict);
        assert.isUndefined(filters.$not['shouldRestrict.this']);
        assert.isDefined(filters.$nor[0].test);
        assert.isUndefined(filters.$nor[0].shouldRestrict);
        assert.isUndefined(filters.$nor[0]['shouldRestrict.this']);
        assert.isDefined(filters.$and[0].test);
        assert.isUndefined(filters.$and[0].shouldRestrict);
        assert.isUndefined(filters.$and[0]['shouldRestrict.this']);
        assert.isDefined(filters.$and[1].test);
        assert.isUndefined(filters.$and[1].shouldRestrict);
        assert.isUndefined(filters.$and[1]['shouldRestrict.this']);
        assert.isDefined(filters.$or[0].$and[0].test);
        assert.isUndefined(filters.$or[0].$and[0].shouldRestrict);
        assert.isUndefined(filters.$or[0].$and[0]['shouldRestrict.this']);

        let options2 = {fields: {test: 1}};
        restrictFields({}, options2, ['test']);
        assert.isUndefined(options2.fields.test);
        assert.isDefined(options2.fields._id);
    });

    it('Should restrict links # getLinks', function () {
        import { getLinks } from '../../lib/restrictLinks.js';

        let data = getLinks({
            collection: {
                __exposure: {
                    config: {
                        restrictLinks: ['1', '2']
                    }
                }
            }
        });

        assert.lengthOf(data, 2);

        data = getLinks({
            collection: {
                __exposure: {
                    config: {
                        restrictLinks: function() {
                            return ['1', '2']
                        }
                    }
                }
            }
        });

        assert.lengthOf(data, 2);
    });

    it('Should be able to enforce a maxLimit', function () {
        let options = {};

        enforceMaxLimit(options, 100);
        assert.equal(options.limit, 100);

        options = {limit: 101};
        enforceMaxLimit(options, 100);
        assert.equal(options.limit, 100);

        options = {limit: 99};
        enforceMaxLimit(options, 100);
        assert.equal(options.limit, 99);
    });

    it('Should be able to get the propper depth of a node', function () {
        let root = new CollectionNode();

        let subroot1 = new CollectionNode();
        let subroot2 = new CollectionNode();
        root.add(subroot1);
        root.add(subroot2);

        let subsubroot1 = new CollectionNode();
        subroot1.add(subsubroot1);

        subsubroot1.add(new CollectionNode());

        subroot2.add(new CollectionNode());

        assert.equal(4, getDepth(root));
    });

    it('Should be able to enforce depth of a node', function () {
        let root = new CollectionNode();

        let subroot1 = new CollectionNode();
        let subroot2 = new CollectionNode();
        root.add(subroot1);
        root.add(subroot2);

        let subsubroot1 = new CollectionNode();
        subroot1.add(subsubroot1);

        subsubroot1.add(new CollectionNode());

        subroot2.add(new CollectionNode());

        assert.equal(4, getDepth(root));

        const fn = () => {
            enforceMaxDepth(root, 3);
        };

        assert.throws(fn, /graph request is too deep/);
    });

    it('Should work intersect with computation and with infinite recursion avoidance', function () {
        const link2 = (item) => {
            return {
                item,
                link1
            }
        };

        const link1 = (item) => {
            return {
                item,
                link2
            }
        };

        const obj1 = {
            a: 1,
            link1
        };

        const obj2 = {
            $filters: {
                a: {$gt: 2},
                b: {$gt: 2},
                $and: [
                    {
                        a: {$gt: 2},
                        b: {$gt: 2}
                    },
                    {
                        b: {$gt: 2}
                    }
                ],
                $not: {
                    a: {$gt: 2},
                    b: {$gt: 2}
                }
            },
            a: {
                a1: 1
            },
            link1: {
                item: 1,
                link2: {
                    item: 1,
                    link1: {
                        item: 1
                    }
                }
            }
        };

        const result = cleanBody(obj1, obj2, 'test');

        assert.isObject(result.a);
        assert.isDefined(result.a.a1);
        assert.isObject(result.link1);
        assert.equal(result.link1.item, 'test');
        assert.isObject(result.link1.link2);
        assert.equal(result.link1.link2.item, 'test');
        assert.isObject(result.link1.link2.link1);
        assert.equal(result.link1.link2.link1.item, 'test');

        assert.isObject(result.$filters);
        assert.isObject(result.$filters.a);
        assert.isUndefined(result.$filters.b);
        assert.equal(result.$filters.a.$gt, 2);

        assert.isArray(result.$filters.$and);
        assert.equal(result.$filters.$and[0].a.$gt, 2);
        assert.isUndefined(result.$filters.$and[0].b);
        assert.isUndefined(result.$filters.$and[1].b);
        assert.equal(result.$filters.$and[0].a.$gt, 2);
        assert.isObject(result.$filters.$not);
        assert.isUndefined(result.$filters.$not.b);
        assert.equal(result.$filters.$not.a.$gt, 2);
    });

    it('Should work with cleanBody allow all method', function () {
        const body = cleanBody({
            a: true
        }, {
            a: {
                b: {
                    c: 1
                }
            }
        });

        assert.isObject(body.a);
        assert.isObject(body.a.b);
        assert.equal(body.a.b.c, 1);
    });

    it('Should properly clean selectors', function () {
        let filters = {
            'profile.firstName': 'Theodor'
        };

        cleanFilters(filters, ['profile'])

        assert.equal(filters['profile.firstName'], 'Theodor');
    })
});