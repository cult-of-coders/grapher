PostCollection.remove({});
CommentCollection.remove({});
GroupCollection.remove({});
AuthorCollection.remove({});

PostCollection.expose();

let authorId = AuthorCollection.insert({name: 'John McSmithie'});

let postId = PostCollection.insert({
    title: 'Hello',
    nested: {data: 'Yes'}
});

let authorLink = PostCollection.getLink(postId, 'author');
authorLink.set(authorId);


PostCollection.insert({title: 'Goodbye'});

let groupId1 = GroupCollection.insert({name: 'Main Group'});
let groupId2 = GroupCollection.insert({name: 'Secondary Group'});

GroupCollection.insert({name: 'Anonymous Group'});

let commentId1 = CommentCollection.insert({text: 'Sample', isBanned: false});
let commentId2 = CommentCollection.insert({text: 'Sample', isBanned: false});
let commentId3 = CommentCollection.insert({text: 'Sample', isBanned: true});

CommentCollection.getLink(commentId1, 'author').set(authorId);
CommentCollection.getLink(commentId2, 'author').set(authorId);
CommentCollection.getLink(commentId3, 'author').set(authorId);

CommentCollection.insert({text: 'Anonymous Comment'});

let post = PostCollection.findOne(postId);

let groupsLink = PostCollection.getLink(post, 'groups');
groupsLink.add(groupId1, {isAdmin: true});
groupsLink.add(groupId2, {isAdmin: false});

let commentLink = PostCollection.getLink(post, 'comments');
commentLink.add([commentId1, commentId2, commentId3]);

// to properly test resolving
CommentCollection.insert({resourceId: post._id});
