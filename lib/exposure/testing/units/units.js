import restrictFields from '../../lib/restrictFields.js';
import enforceMaxLimit from '../../lib/enforceMaxLimit.js';
import enforceMaxDepth, {getDepth} from '../../lib/enforceMaxDepth.js';
import CollectionNode from '../../../query/nodes/collectionNode.js';

describe('Unit Tests', function () {
    it('Should be able to restrict fields', function () {
        let filters = {
            test: 1,
            shouldRestrict: 1,
            shouldRestrict2: 1,
            $and: [{
                shouldRestrict: 1,
                test: 1,
            }, {
                test: 1,
                shouldRestrict: 1
            }],
            $or: [{
                $and: [{
                    test: 1,
                    shouldRestrict: 1
                }]
            }],
            $nor: [{
                test: 1,
                shouldRestrict: 1
            }],
            $not: {
                test: 1,
                shouldRestrict: 1
            }
        };

        let options = {
            sort: {
                test: 1,
                shouldRestrict: 1,
                shouldRestrict2: 1,
            },
            fields: {
                test: 1,
                shouldRestrict: 1,
                shouldRestrict2: 1
            }
        };

        restrictFields(filters, options, ['shouldRestrict', 'shouldRestrict2']);

        assert.lengthOf(_.keys(filters), 5);
        assert.equal(filters.test, 1);

        assert.lengthOf(_.keys(options.sort), 1);
        assert.equal(options.sort.test, 1);

        assert.lengthOf(_.keys(options.fields), 1);
        assert.equal(options.fields.test, 1);

        assert.isDefined(filters.$not.test);
        assert.isUndefined(filters.$not.shouldRestrict);
        assert.isDefined(filters.$nor[0].test);
        assert.isUndefined(filters.$nor[0].shouldRestrict);
        assert.isDefined(filters.$and[0].test);
        assert.isUndefined(filters.$and[0].shouldRestrict);
        assert.isDefined(filters.$and[1].test);
        assert.isUndefined(filters.$and[1].shouldRestrict);
        assert.isDefined(filters.$or[0].$and[0].test);
        assert.isUndefined(filters.$or[0].$and[0].shouldRestrict);
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
});