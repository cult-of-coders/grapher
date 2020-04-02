import {expect} from 'chai';
import Linker from "../../../links/linker";
import {assembleMany, assembleManyMeta, assembleOne, assembleOneMeta} from "../assembler";

describe('Assembler test', function () {
    const COMMENTS = [{
        _id: 1,
        text: 'Text 1',
        originalId: 1,
    }, {
        _id: 2,
        text: 'Text 2',
        originalId: 2,
    }, {
        _id: 3,
        text: 'Text 3',
        originalId: 1,
    }, {
        _id: 4,
        text: 'Text 4',
        originalId: 4,
    }];

    const GROUPED_COMMENTS_BY_ID = _.groupBy(COMMENTS, '_id');
    const GROUPED_COMMENTS_BY_ORIGINAL_ID = _.groupBy(COMMENTS, 'originalId');

    describe('one', function () {
        const ONE_LINK = new Linker(null, 'comment', {
            type: 'one',
            field: 'commentId',
            collection: new Mongo.Collection(null),
        });

        it('works in trivial case', function () {
            const childCollectionNode = {
                linkName: 'comment',
            };

            const parentResult = {
                _id: 1,
                commentId: 1,
            };

            assembleOne(parentResult, {
                childCollectionNode,
                linker: ONE_LINK,
                resultsByKeyId: GROUPED_COMMENTS_BY_ID,
            });

            expect(parentResult.comment).to.be.an('array').and.have.length(1);
        });

        describe('nested objects', function () {
            const NESTED_OBJECT_ONE_LINK = new Linker(null, 'meta.comment', {
                type: 'one',
                field: 'meta.commentId',
                collection: new Mongo.Collection(null),
            });

            const NESTED_OBJECT_ONE_LINK_FOREIGN_FIELD = new Linker(null, 'meta.comment', {
                type: 'one',
                field: 'meta.commentId',
                foreignIdentityField: 'originalId',
                collection: new Mongo.Collection(null),
            });

            it('works for nested objects', function () {
                const childCollectionNode = {
                    linkName: 'meta.comment',
                };

                const parentResult = {
                    _id: 1,
                    meta: {
                        commentId: 1,
                    },
                };

                assembleOne(parentResult, {
                    childCollectionNode,
                    linker: NESTED_OBJECT_ONE_LINK,
                    resultsByKeyId: GROUPED_COMMENTS_BY_ID,
                });

                expect(parentResult.meta.comment).to.be.an('array').and.have.length(1);
            });

            it('works for nested objects when nested object is empty', function () {
                const childCollectionNode = {
                    linkName: 'meta.comment',
                };

                const parentResult = {
                    _id: 1,
                };

                assembleOne(parentResult, {
                    childCollectionNode,
                    linker: NESTED_OBJECT_ONE_LINK,
                    resultsByKeyId: GROUPED_COMMENTS_BY_ID,
                });

                expect(parentResult.meta).to.be.undefined;
            });

            it('works for nested objects with foreign field', function () {
                const childCollectionNode = {
                    linkName: 'meta.comments',
                };

                const parentResult = {
                    _id: 1,
                    meta: {
                        commentId: 1,
                    },
                };

                assembleOne(parentResult, {
                    childCollectionNode,
                    linker: NESTED_OBJECT_ONE_LINK_FOREIGN_FIELD,
                    resultsByKeyId: GROUPED_COMMENTS_BY_ORIGINAL_ID,
                });

                expect(parentResult.meta.comments).to.be.an('array').and.have.length(2);
            });
        });

        describe('nested array', function () {
            const NESTED_ARRAY_ONE_LINK = new Linker(null, 'meta.comment', {
                type: 'many',
                field: 'meta.commentId',
                collection: new Mongo.Collection(null),
            });

            const NESTED_ONE_ONE_LINK_FOREIGN_FIELD = new Linker(null, 'meta.comment', {
                type: 'many',
                field: 'meta.commentId',
                foreignIdentityField: 'originalId',
                collection: new Mongo.Collection(null),
            });

            it('works for nested arrays', function () {
                const childCollectionNode = {
                    linkName: 'meta.comments',
                };

                const parentResult = {
                    _id: 1,
                    meta: [{
                        commentId: 1,
                    }, {
                        commentId: 2,
                    }],
                };

                assembleOne(parentResult, {
                    childCollectionNode,
                    linker: NESTED_ARRAY_ONE_LINK,
                    resultsByKeyId: GROUPED_COMMENTS_BY_ID,
                });

                expect(parentResult.meta[0].comments).to.be.an('array').and.have.length(1);
                expect(parentResult.meta[1].comments).to.be.an('array').and.have.length(1);
            });

            it('works for nested arrays with foreign field', function () {
                const childCollectionNode = {
                    linkName: 'meta.comments',
                };

                const parentResult = {
                    _id: 1,
                    meta: [{
                        commentId: 1,
                    }, {

                    }],
                };

                assembleOne(parentResult, {
                    childCollectionNode,
                    linker: NESTED_ONE_ONE_LINK_FOREIGN_FIELD,
                    resultsByKeyId: GROUPED_COMMENTS_BY_ORIGINAL_ID,
                });

                expect(parentResult.meta[0].comments).to.be.an('array').and.have.length(2);
                expect(parentResult.meta[1].comments).to.be.undefined;
            });
        });
    });

    describe('many', function () {
        const MANY_LINK = new Linker(null, 'comments', {
            type: 'many',
            field: 'commentIds',
            collection: new Mongo.Collection(null),
        });

        it('works in trivial case', function () {
            const childCollectionNode = {
                linkName: 'comments',
            };

            const parentResult = {
                _id: 1,
                commentIds: [1, 2],
            };

            assembleMany(parentResult, {
                childCollectionNode,
                linker: MANY_LINK,
                resultsByKeyId: GROUPED_COMMENTS_BY_ID,
            });

            expect(parentResult.comments).to.be.an('array').and.have.length(2);
        });

        describe('nested objects', function () {
            const NESTED_OBJECT_MANY_LINK = new Linker(null, 'meta.comments', {
                type: 'many',
                field: 'meta.commentIds',
                collection: new Mongo.Collection(null),
            });

            const NESTED_OBJECT_MANY_LINK_FOREIGN_FIELD = new Linker(null, 'meta.comments', {
                type: 'many',
                field: 'meta.commentIds',
                foreignIdentityField: 'originalId',
                collection: new Mongo.Collection(null),
            });

            it('works for nested objects', function () {
                const childCollectionNode = {
                    linkName: 'meta.comments',
                };

                const parentResult = {
                    _id: 1,
                    meta: {
                        commentIds: [1, 2],
                    },
                };

                assembleMany(parentResult, {
                    childCollectionNode,
                    linker: NESTED_OBJECT_MANY_LINK,
                    resultsByKeyId: GROUPED_COMMENTS_BY_ID,
                });

                expect(parentResult.meta.comments).to.be.an('array').and.have.length(2);
            });

            it('works for nested objects when nested object is empty', function () {
                const childCollectionNode = {
                    linkName: 'meta.comments',
                };

                const parentResult = {
                    _id: 1,
                };

                assembleOne(parentResult, {
                    childCollectionNode,
                    linker: NESTED_OBJECT_MANY_LINK,
                    resultsByKeyId: GROUPED_COMMENTS_BY_ID,
                });

                expect(parentResult.meta).to.be.undefined;
            });

            it('works for nested objects with foreign field', function () {
                const childCollectionNode = {
                    linkName: 'meta.comments',
                };

                const parentResult = {
                    _id: 1,
                    meta: {
                        commentIds: [1, 4],
                    },
                };

                assembleMany(parentResult, {
                    childCollectionNode,
                    linker: NESTED_OBJECT_MANY_LINK_FOREIGN_FIELD,
                    resultsByKeyId: GROUPED_COMMENTS_BY_ORIGINAL_ID,
                });

                expect(parentResult.meta.comments).to.be.an('array').and.have.length(3);
            });
        });

        describe('nested arrays', function () {
            const NESTED_ARRAY_MANY_LINK = new Linker(null, 'meta.comments', {
                type: 'many',
                field: 'meta.commentIds',
                collection: new Mongo.Collection(null),
            });

            const NESTED_ARRAY_MANY_LINK_FOREIGN_FIELD = new Linker(null, 'meta.comments', {
                type: 'many',
                field: 'meta.commentIds',
                foreignIdentityField: 'originalId',
                collection: new Mongo.Collection(null),
            });

            it('works for nested arrays', function () {
                const childCollectionNode = {
                    linkName: 'meta.comments',
                };

                const parentResult = {
                    _id: 1,
                    meta: [{
                        commentIds: [1, 2],
                    }, {
                        commentIds: [3],
                    }],
                };

                assembleMany(parentResult, {
                    childCollectionNode,
                    linker: NESTED_ARRAY_MANY_LINK,
                    resultsByKeyId: GROUPED_COMMENTS_BY_ID,
                });

                expect(parentResult.meta[0].comments).to.be.an('array').and.have.length(2);
                expect(_.pluck(parentResult.meta[0].comments, '_id')).to.be.eql([1, 2]);
                expect(parentResult.meta[1].comments).to.be.an('array').and.have.length(1);
            });

            it('works for nested arrays with foreign field', function () {
                const childCollectionNode = {
                    linkName: 'meta.comments',
                };

                const parentResult = {
                    _id: 1,
                    meta: [{
                        commentIds: [1, 2],
                    }, {
                        commentIds: [4],
                    }],
                };

                assembleMany(parentResult, {
                    childCollectionNode,
                    linker: NESTED_ARRAY_MANY_LINK_FOREIGN_FIELD,
                    resultsByKeyId: GROUPED_COMMENTS_BY_ORIGINAL_ID,
                });

                expect(parentResult.meta[0].comments).to.be.an('array').and.have.length(3);
                expect(_.pluck(parentResult.meta[0].comments, '_id')).to.be.eql([1, 3, 2]);
                expect(parentResult.meta[1].comments).to.be.an('array').and.have.length(1);
            });
        });
    });

    describe('one-meta', function () {
        const ONE_META_LINK = new Linker(null, 'comment', {
            type: 'one',
            field: '_comment',
            metadata: true,
            collection: new Mongo.Collection(null),
        });

        it('works in trivial case', function () {
            const childCollectionNode = {
                linkName: 'comment',
            };

            const parentResult = {
                _id: 1,
                _comment: {
                    _id: 1,
                    public: true,
                },
            };

            assembleOneMeta(parentResult, {
                childCollectionNode,
                linker: ONE_META_LINK,
                resultsByKeyId: GROUPED_COMMENTS_BY_ID,
            });

            expect(parentResult.comment).to.be.an('array').and.have.length(1);
            expect(parentResult.comment[0]._id).to.be.equal(1);
        });
    });

    describe('many-meta', function () {
        const MANY_META_LINK = new Linker(null, 'comments', {
            type: 'many',
            field: '_comments',
            metadata: true,
            collection: new Mongo.Collection(null),
        });

        it('works in trivial case', function () {
            const childCollectionNode = {
                linkName: 'comments',
            };

            const parentResult = {
                _id: 1,
                _comments: [{
                    _id: 1,
                    public: true,
                }, {
                    _id: 3,
                    public: false,
                }],
            };

            assembleManyMeta(parentResult, {
                childCollectionNode,
                linker: MANY_META_LINK,
                resultsByKeyId: GROUPED_COMMENTS_BY_ID,
            });

            expect(parentResult.comments).to.be.an('array').and.have.length(2);
            expect(parentResult.comments[0]._id).to.be.equal(1);
            expect(parentResult.comments[1]._id).to.be.equal(3);
        });
    });
});
