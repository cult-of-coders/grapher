import { assert, expect } from "chai";
import { Random } from 'meteor/random';

//import {
//    PostCollection,
//    CategoryCollection,
//    CommentCollection,
//    ResolverCollection
//} from './collections.js';
let PostCollection = new Mongo.Collection("test_post");
let CategoryCollection = new Mongo.Collection("test_category");
let CommentCollection = new Mongo.Collection("test_comment");
let ResolverCollection = new Mongo.Collection("test_resolver");
let SCDCollection = new Mongo.Collection('test_scd');
let ReferenceCollection = new Mongo.Collection('test_scd_refs');

PostCollection.addLinks({
    comments: {
        type: "*",
        collection: CommentCollection,
        field: "commentIds",
        index: true
    },
    commentsUnique: {
        type: "*",
        collection: CommentCollection,
        field: "commentUniqueIds",
        unique: true,
    },
    autoRemoveComments: {
        type: "*",
        collection: CommentCollection,
        field: "autoRemoveCommentIds",
        autoremove: true
    },
    autoRemovingSelfComments: {
        type: "*",
        collection: CommentCollection,
        field: "autoRemovingSelfCommentsIds"
    },
    metaComments: {
        type: "*",
        collection: CommentCollection,
        metadata: true
    },
    category: {
        collection: CategoryCollection,
        type: "1"
    },
    metaCategory: {
        metadata: true,
        collection: CategoryCollection,
        type: "1"
    },
    inversedComment: {
        collection: CommentCollection,
        inversedBy: "inversedPost"
    }
});

CommentCollection.addLinks({
    post: {
        collection: PostCollection,
        inversedBy: "comments"
    },
    postUnique: {
        collection: PostCollection,
        inversedBy: "commentsUnique"
    },
    inversedPost: {
        collection: PostCollection,
        field: "postId"
    },
    autoRemovePosts: {
        collection: PostCollection,
        inversedBy: "autoRemovingSelfComments",
        autoremove: true
    },
    metaPost: {
        collection: PostCollection,
        inversedBy: "metaComments"
    }
});

CategoryCollection.addLinks({
    posts: {
        collection: PostCollection,
        inversedBy: "category"
    },
    metaPosts: {
        collection: PostCollection,
        inversedBy: "metaCategory"
    }
});

ReferenceCollection.addLinks({
    scds: {
        type: 'many',
        collection: SCDCollection,
        field: 'scdId',
        foreignIdentityField: 'originalId',
    },
    scd: {
        collection: SCDCollection,
        inversedBy: 'ref',
    },
})

SCDCollection.addLinks({
    refs: {
        collection: ReferenceCollection,
        inversedBy: 'scds',
        autoremove: true,
    },
    ref: {
        type: 'one',
        collection: ReferenceCollection,
        field: 'someId',
        foreignIdentityField: 'some2Id',
        autoremove: true,
    },
});

describe("Collection Links", function() {
    PostCollection.remove({});
    CategoryCollection.remove({});
    CommentCollection.remove({});

    it("Test Many", function() {
        let postId = PostCollection.insert({ text: "abc" });
        let commentId = CommentCollection.insert({ text: "abc" });

        let post = PostCollection.findOne(postId);
        const link = PostCollection.getLink(post, "comments");
        link.add(commentId);
        assert.lengthOf(link.find().fetch(), 1);

        link.remove(commentId);
        assert.lengthOf(link.find().fetch(), 0);
    });

    it("Tests One", function() {
        let postId = PostCollection.insert({ text: "abc" });
        let categoryId = CategoryCollection.insert({ text: "abc" });

        let post = PostCollection.findOne(postId);

        const link = PostCollection.getLink(post, "category");
        link.set(categoryId);
        assert.lengthOf(link.find().fetch(), 1);

        assert.equal(categoryId, link.fetch()._id);

        link.unset();
        assert.lengthOf(link.find().fetch(), 0);
    });

    it("Tests One Meta", function() {
        let postId = PostCollection.insert({ text: "abc" });
        let categoryId = CategoryCollection.insert({ text: "abc" });

        let post = PostCollection.findOne(postId);

        let link = PostCollection.getLink(post, "metaCategory");
        link.set(categoryId, { date: new Date() });

        assert.lengthOf(link.find().fetch(), 1);
        let metadata = link.metadata();

        assert.isObject(metadata);
        assert.instanceOf(metadata.date, Date);

        link.metadata({
            updated: new Date()
        });

        post = PostCollection.findOne(postId);
        link = PostCollection.getLink(post, "metaCategory");
        assert.instanceOf(link.metadata().updated, Date);

        link.unset();
        assert.lengthOf(link.find().fetch(), 0);
    });

    it("Tests Many Meta", function() {
        let postId = PostCollection.insert({ text: "abc" });
        let commentId = CommentCollection.insert({ text: "abc" });

        let post = PostCollection.findOne(postId);
        let metaCommentsLink = PostCollection.getLink(post, "metaComments");

        metaCommentsLink.add(commentId, { date: new Date() });
        assert.lengthOf(metaCommentsLink.find().fetch(), 1);

        // verifying reverse search
        let metaComment = CommentCollection.findOne(commentId);
        let metaPostLink = CommentCollection.getLink(metaComment, "metaPost");
        assert.lengthOf(metaPostLink.find().fetch(), 1);

        let metadata = metaCommentsLink.metadata(commentId);

        assert.isObject(metadata);
        assert.instanceOf(metadata.date, Date);

        metaCommentsLink.metadata(commentId, { updated: new Date() });

        post = PostCollection.findOne(postId);
        metaCommentsLink = PostCollection.getLink(post, "metaComments");

        metadata = metaCommentsLink.metadata(commentId);
        assert.instanceOf(metadata.updated, Date);

        metaCommentsLink.remove(commentId);
        assert.lengthOf(metaCommentsLink.find().fetch(), 0);
    });

    it("Tests $meta filters for One & One-Virtual", function() {
        let postId = PostCollection.insert({ text: "abc" });
        let categoryId = CategoryCollection.insert({ text: "abc" });
        let post = PostCollection.findOne(postId);
        let postMetaCategoryLink = PostCollection.getLink(post, "metaCategory");
        postMetaCategoryLink.set(categoryId, { valid: true });

        let result = postMetaCategoryLink.fetch({ $meta: { valid: true } });
        assert.isObject(result);

        result = postMetaCategoryLink.fetch({ $meta: { valid: false } });

        assert.isUndefined(result);
        const metaCategoryPostLink = CategoryCollection.getLink(
            categoryId,
            "metaPosts"
        );

        result = metaCategoryPostLink.fetch({ $meta: { valid: true } });
        assert.lengthOf(result, 1);

        result = metaCategoryPostLink.fetch({ $meta: { valid: false } });
        assert.lengthOf(result, 0);
    });

    it("Tests $meta filters for Many & Many-Virtual", function() {
        let postId = PostCollection.insert({ text: "abc" });
        let commentId1 = CommentCollection.insert({ text: "abc" });
        let commentId2 = CommentCollection.insert({ text: "abc" });

        let postMetaCommentsLink = PostCollection.getLink(
            postId,
            "metaComments"
        );

        postMetaCommentsLink.add(commentId1, { approved: true });
        postMetaCommentsLink.add(commentId2, { approved: false });

        let result = postMetaCommentsLink.fetch({ $meta: { approved: true } });

        assert.lengthOf(result, 1);

        result = postMetaCommentsLink.fetch({ $meta: { approved: false } });

        assert.lengthOf(result, 1);

        const comment1MetaPostsLink = CommentCollection.getLink(
            commentId1,
            "metaPost"
        );
        result = comment1MetaPostsLink.fetch({ $meta: { approved: true } });
        assert.lengthOf(result, 1);
        result = comment1MetaPostsLink.fetch({ $meta: { approved: false } });
        assert.lengthOf(result, 0);

        const comment2MetaPostsLink = CommentCollection.getLink(
            commentId2,
            "metaPost"
        );
        result = comment2MetaPostsLink.fetch({ $meta: { approved: true } });
        assert.lengthOf(result, 0);
        result = comment2MetaPostsLink.fetch({ $meta: { approved: false } });
        assert.lengthOf(result, 1);
    });

    it("Tests inversedBy findings", function() {
        let postId = PostCollection.insert({ text: "abc" });
        let commentId = CommentCollection.insert({ text: "abc" });

        let post = PostCollection.findOne(postId);
        let comment = CommentCollection.findOne(commentId);
        let commentsLink = PostCollection.getLink(post, "comments");
        let commentsUniqueLink = PostCollection.getLink(post, "commentsUnique");
        let metaCommentsLink = PostCollection.getLink(post, "metaComments");
        let postLink = CommentCollection.getLink(comment, "post");
        let postUniqueLink = CommentCollection.getLink(comment, "postUnique");
        let postMetaLink = CommentCollection.getLink(comment, "metaPost");

        commentsLink.add(comment);
        commentsUniqueLink.add(comment);
        metaCommentsLink.add(comment);
        assert.lengthOf(postLink.find().fetch(), 1);
        assert.isObject(postUniqueLink.fetch());
        assert.lengthOf(postMetaLink.find().fetch(), 1);

        post = PostCollection.findOne(postId);

        CommentCollection.remove(comment._id);
        post = PostCollection.findOne(postId);
        assert.notInclude(post.commentIds, comment._id);
    });

    it("Should auto-save object", function() {
        let comment = { text: "abc" };

        let postId = PostCollection.insert({ text: "hello" });
        const postLink = PostCollection.getLink(postId, "comments").add(
            comment
        );

        assert.isDefined(comment._id);
        assert.lengthOf(postLink.fetch(), 1);
    });

    it("Should have indexes set up", function() {
        const raw = PostCollection.rawCollection();
        const indexes = Meteor.wrapAsync(raw.indexes, raw)();

        const found = _.find(indexes, index => {
            return index.key.commentIds == 1;
        });

        assert.isObject(found);
    });

    it("Should auto-remove some objects", function() {
        let comment = { text: "abc" };

        let postId = PostCollection.insert({ text: "hello" });
        let postLink = PostCollection.getLink(postId, "comments").add(comment);

        assert.isNotNull(comment._id);
        PostCollection.remove(postId);
        assert.isNotNull(CommentCollection.findOne(comment._id));

        comment = { text: "abc" };
        postId = PostCollection.insert({ text: "hello" });
        postLink = PostCollection.getLink(postId, "autoRemoveComments").add(
            comment
        );

        assert.isDefined(comment._id);
        PostCollection.remove(postId);
        assert.isUndefined(CommentCollection.findOne(comment._id));
    });

    it("Should allow actions from inversed links", function() {
        let comment = { text: "abc" };

        let postId = PostCollection.insert({ text: "hello" });
        const commentId = CommentCollection.insert(comment);

        CommentCollection.getLink(commentId, "post").set(postId);

        assert.lengthOf(PostCollection.getLink(postId, "comments").fetch(), 1);

        CommentCollection.getLink(commentId, "post").add({ text: "hi there" });

        let insertedPostViaVirtual = PostCollection.findOne({
            text: "hi there"
        });
        assert.isObject(insertedPostViaVirtual);

        assert.lengthOf(
            PostCollection.getLink(insertedPostViaVirtual, "comments").fetch(),
            1
        );

        const category = CategoryCollection.findOne();
        let postsCategoryLink = CategoryCollection.getLink(category, "posts");
        postsCategoryLink.add(insertedPostViaVirtual);

        assert.equal(
            category._id,
            PostCollection.getLink(insertedPostViaVirtual, "category").fetch()
                ._id
        );

        // TESTING META
        let categoryMetaPostLink = CategoryCollection.getLink(
            category,
            "metaPosts"
        );
        categoryMetaPostLink.add(insertedPostViaVirtual, {
            testValue: "boom!"
        });

        let postMetaCategoryLink = PostCollection.getLink(
            insertedPostViaVirtual,
            "metaCategory"
        );
        assert.equal("boom!", postMetaCategoryLink.metadata().testValue);
    });

    it("Should fail when you try to add a non-existing link", function(done) {
        let postId = PostCollection.insert({ text: "hello" });

        try {
            PostCollection.getLink(postId, "comments").add("XXXXXXX");
        } catch (e) {
            assert.equal(e.error, "not-found");
            done();
        }
    });

    it("Should work with autoremoval from inversed and direct link", function() {
        // autoremoval from direct side
        let postId = PostCollection.insert({ text: "autoremove" });
        const postAutoRemoveCommentsLink = PostCollection.getLink(
            postId,
            "autoRemoveComments"
        );

        postAutoRemoveCommentsLink.add({ text: "hello" });

        assert.lengthOf(postAutoRemoveCommentsLink.find().fetch(), 1);
        let commentId = postAutoRemoveCommentsLink.find().fetch()[0]._id;

        assert.isObject(CommentCollection.findOne(commentId));
        PostCollection.remove(postId);
        assert.isUndefined(CommentCollection.findOne(commentId));

        // now from inversed side
        commentId = CommentCollection.insert({ text: "autoremove" });

        const commentAutoRemovePostsLink = CommentCollection.getLink(
            commentId,
            "autoRemovePosts"
        );
        commentAutoRemovePostsLink.add({ text: "Hello" });

        assert.lengthOf(commentAutoRemovePostsLink.find().fetch(), 1);
        postId = commentAutoRemovePostsLink.find().fetch()[0]._id;

        assert.isObject(PostCollection.findOne(postId));
        CommentCollection.remove(commentId);
        assert.isUndefined(PostCollection.findOne(postId));
    });

    it("Should set meta link in inversed one-meta", function() {
        const CollectionA = new Mongo.Collection('collectionA' + Random.id());
        const CollectionB = new Mongo.Collection('collectionB' + Random.id());

        CollectionA.addLinks({
            oneMeta: {
                collection: CollectionB,
                field: "oneMetaLink",
                type: "one",
                metadata: true
            }
        });

        CollectionB.addLinks({
            oneMetaA: {
                collection: CollectionA,
                inversedBy: "oneMeta"
            }
        });

        const ADocId = CollectionA.insert({ value: 3 });
        const BDocId = CollectionB.insert({ value: 5 });

        // console.log({ADocId, BDocId})

        CollectionB.getLink(BDocId, "oneMetaA").set(ADocId, {
            data: "someData"
        });

        const result = CollectionA.createQuery({
            $filters: { _id: ADocId },
            oneMeta: { _id: 1, metadata: 1 }
        }).fetchOne();

        assert.equal('someData', result.oneMeta.$metadata.data);
    });

    it("Should not result in duplicate key error on Many Unique links", function() {
      let postIdA = PostCollection.insert({ text: "abc" });
      let postIdB = PostCollection.insert({ text: "abc" });

      PostCollection.remove(postIdA);
      PostCollection.remove(postIdB);
    });


    describe('foreignIdentityField linkConfig param', function () {
        beforeEach(function () {
            SCDCollection.remove({});
            ReferenceCollection.remove({});
        });

        it("Works with foreign field - many", function () {
            SCDCollection.insert({_id: '1', originalId: '1'});
            SCDCollection.insert({_id: '2', originalId: '1'});
            SCDCollection.insert({_id: '3', originalId: '3'});
            const scd4Id = SCDCollection.insert({_id: '4', originalId: '4'});

            ReferenceCollection.insert({scdId: '1'});
            ReferenceCollection.insert({scdId: '3'});
            const ref3Id = ReferenceCollection.insert({});

            const linkRef = ReferenceCollection.getLink({scdId: '1'}, "scds");
            // both SCDs should be found since they share originalId
            assert.lengthOf(linkRef.find().fetch(), 2);

            const linkSCD = SCDCollection.getLink({_id: '2', originalId: '1'}, "refs");
            assert.lengthOf(linkSCD.find().fetch(), 1);

            // check if it works when links do not exist
            const link = ReferenceCollection.getLink(ref3Id, "scds");
            assert.lengthOf(link.find().fetch(), 0);

            const inversedLink = SCDCollection.getLink(scd4Id, "refs");
            assert.lengthOf(inversedLink.find().fetch(), 0);
        });

        it("Auto-removes for foreign field - many", function () {
            SCDCollection.insert({_id: '1', originalId: '1'});
            SCDCollection.insert({_id: '2', originalId: '1'});

            ReferenceCollection.insert({scdId: '1'});

            // assert.equal(ReferenceCollection.find().count(), 0);
            SCDCollection.remove('1');

            assert.equal(ReferenceCollection.find().count(), 0);
        });

        it("Works with foreign field - one", function () {
            SCDCollection.insert({someId: '1'});

            ReferenceCollection.insert({some2Id: '1'});
            const ref2Id = ReferenceCollection.insert({some2Id: '2'});

            const linkSCD = SCDCollection.getLink({someId: '1'}, "ref");
            assert.lengthOf(linkSCD.find().fetch(), 1);

            const linkRef = ReferenceCollection.getLink({some2Id: '1'}, "scd");
            assert.lengthOf(linkRef.find().fetch(), 1);

            // check if it works when links do not exist
            const newId = SCDCollection.insert({}); // no someId
            const link = SCDCollection.getLink(newId, "ref");
            assert.lengthOf(link.find().fetch(), 0);

            // inversed
            const inversedLink = ReferenceCollection.getLink(ref2Id, "scd");
            assert.lengthOf(inversedLink.find().fetch(), 0);
        });

        it("Auto-removes for foreign field - one", function () {
            SCDCollection.insert({_id: '1', someId: '1'});

            ReferenceCollection.insert({some2Id: '1'});
            ReferenceCollection.insert({some2Id: '2'});

            SCDCollection.remove('1');

            assert.equal(ReferenceCollection.find().count(), 1);
        });
    });
});
