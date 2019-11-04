import { assert } from "chai";


describe("Links Client Tests", function() {

    it("Test remove many", function() {
        let PostCollection = new Mongo.Collection(null);
        let CommentCollection = new Mongo.Collection(null);

        PostCollection.addLinks({
            comments: {
                type: "many",
                collection: CommentCollection,
                field: "commentIds",
                index: true,
            }
        });

        let postId = PostCollection.insert({ text: "abc" });
        let commentId = CommentCollection.insert({ text: "abc" });

        const link = PostCollection.getLink(postId, "comments");
        link.add(commentId);
        assert.lengthOf(link.find().fetch(), 1);

        link.remove(commentId);

        assert.lengthOf(link.find().fetch(), 0);
    });

});
