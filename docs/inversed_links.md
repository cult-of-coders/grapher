## Inversed Links (Advanced)

Given a relation between collection A and B.
The inversed link is where the "storage" of the links is not present, to be able to perform actions.

The reason we need to define inversedLinks is because you can have multiple relationships with the same collection,
or even a loop-back relationship with the same collection, and we need to identify it.

Let's take a basic example:
```
Comments.addLinks({
    post: {
        collection: Posts,
        type: 'one',
        field: 'postId'
    }
})

Posts.addLinks({
    comments: {
        collection: Comments,
        inversedBy: 'post'
    }
})
```

In the scenario above we store "postId" in the comment documents.

Let's assume commentId and postId are linked.

```
postCommentsLink = Posts.getLink(postId, 'comments') // this is the inversed link
commentsPostLink = Comments.getLink(commentId, 'post')
// postCommentsLink != commentsPostLink
```

When we first designed the API we decided not to allow actions such as "add"/"remove"/"set"/"unset"/"metadata" to be done on the inversed link,
however a good API is a natural programming flow and it should have correct semantics.

So instead of
```
commentId = Comments.insert(commentData);
Comments.getLink(commentId, 'post').set(postId);

// We can do
Posts.getLink(postId, 'comments').add(commentData); // commentData._id will be set in it, if it doesn't exist
Posts.getLink(postId, 'comments').set(commentId)
```

So even if *postId* is stored on *comment* document, it is more natural to "add" a comment to a Post, rather then adding a comment then setting postId.

Performing actions on virtual links are a bit interesting:

1. Set === Add. You can use *add* and *set* on a virtual link, they will have the same effect. Same principle applies to *unset* and *remove*
2. You have smart arguments, meaning you can add multiple arrays of objects, or ids, or objects without ids.The system will be smart enough to guess what you provided. And if it's an object without an id, save it for you.
3. You can use stuff as metadata, as you normally would, but the metadata will be persisted in the other collection. For example:

```
Groups.getLink(groupId, 'users').add([user1Id, user2Object, user3ObjectWithoutId], {isAdmin: true})
Groups.getLink(groupId, 'users').metadata([user1Id, user2Object, user3ObjectWithoutId], {isAdmin: false})
```

### Why did we do this ?

We did this for having your code written in a natural language. There can be many type of relationships. We have 4 type of relationship "storage".
But for example "One" relationship can be a classic SQL "One-To-One" or "Many-To-One", a "Many" relationship can be a One-To-Many or Many-To-Many,
so when you are in need of performing actions on the virtual link, you have the ability to choose between "set/unset", "add/remove" for a natural language.