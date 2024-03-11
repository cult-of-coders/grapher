import {expect} from 'chai';
import {EJSON} from 'meteor/ejson';
import processVirtualNode from "../processVirtualNode";
import CollectionNode from "../../nodes/collectionNode";

const POST_COLLECTION = new Mongo.Collection(null);
const COMMENT_COLLECTION = new Mongo.Collection(null);

describe('processVirtualNode', function () {
    describe('many', function () {
        POST_COLLECTION.addLinks({
            comment: {
                type: 'one',
                field: 'commentId',
                collection: COMMENT_COLLECTION,
            },
            commentForeign: {
                type: 'many',
                field: 'commentId',
                collection: COMMENT_COLLECTION,
                foreignIdentityField: 'originalId',
            }
        });
        COMMENT_COLLECTION.addLinks({
            posts: {
                collection: POST_COLLECTION,
                inversedBy: 'comment',
            },
            postsForeign: {
                collection: POST_COLLECTION,
                inversedBy: 'commentForeign',
            },
        });

        const POSTS = [{
            _id: 1,
            commentId: 1,
        }, {
            _id: 2,
            commentId: 2,
        }, {
            _id: 3,
        }];

        const COMMENTS = [{
            _id: 1,
            text: '1',
            originalId: 1,
        }, {
            _id: 2,
            text: '2',
            originalId: 1,
        }, {
            _id: 3,
            text: '3',
            originalId: 3,
        }];

        /**
         * Assuming query like
         *
         * comments: {
         *     post: {
         *         _id: 1,
         *     }
         * }
         *
         */

        it('works', function () {
            const POST_COLLECTION_NODE = new CollectionNode(POST_COLLECTION, {}, 'posts');
            const COMMENT_COLLECTION_NODE = new CollectionNode(COMMENT_COLLECTION, {});
            COMMENT_COLLECTION_NODE.add(POST_COLLECTION_NODE, COMMENT_COLLECTION.__links['posts']);

            const results = EJSON.clone(COMMENTS);
            POST_COLLECTION_NODE.parent.results = results;

            processVirtualNode(POST_COLLECTION_NODE, POSTS);

            expect(results[0].posts).to.be.an('array').and.be.eql([{_id: 1, commentId: 1}]);
            expect(results[1].posts).to.be.an('array').and.be.eql([{_id: 2, commentId: 2}]);
            expect(results[2].posts).to.be.undefined;
        });

        it('works with foreignIdentityField', function () {
            const POST_COLLECTION_NODE = new CollectionNode(POST_COLLECTION, {}, 'postsForeign');
            const COMMENT_COLLECTION_NODE = new CollectionNode(COMMENT_COLLECTION, {});
            COMMENT_COLLECTION_NODE.add(POST_COLLECTION_NODE, COMMENT_COLLECTION.__links['postsForeign']);

            const results = EJSON.clone(COMMENTS);
            POST_COLLECTION_NODE.parent.results = results;

            processVirtualNode(POST_COLLECTION_NODE, POSTS);

            expect(results[0].postsForeign).to.be.an('array').and.be.eql([{_id: 1, commentId: 1}]);
            expect(results[1].postsForeign).to.be.an('array').and.be.eql([{_id: 1, commentId: 1}]);
            expect(results[2].postsForeign).to.be.undefined;
        });
    });
});
