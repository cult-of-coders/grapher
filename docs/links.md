Collection Links
================

The Mongo.Collection instance now has two methods: addLinks and getLink.
We use *addLinks* to specify the linking configuration, and *getLink* to perform tasks such as fetching linked data, adding a link, removing it, etc.

There are 4 types of relationships:

1. One
------

```javascript
{
    userId: '123'
}
```

2. Many
-------

```javascript
{
    userIds: ['123', '321']
}
```

3. One Meta
-----------
Meta comes from *metadata*

```javascript
{
    userId: {
        _id: '123', isAdmin: true
    }
}
```

4. Many Meta
------------

```javascript
{
    userIds: [
        {_id: '123', isAdmin: true},
        {_id: '321', isAdmin: false}
    ]
}
```


Simplest Link
-------------
Let's explore them one by one, and find out more about linking.
You have a Comment that is posted by an User. So most likely you will store userId in the Comment document. This is a "one" relationship.

```javascript
// comment
{
    text: 'Hello Grapher!',
    userId: 'some_user_id'
}
```

To create this kind of link we would do:
```javascript
const Users = Meteor.users;
const Comments = new Mongo.Collection('comments');

Comments.addLinks({
    user: { // the name of the link, it's how we uniquely identify it
        type: 'one',
        collection: Users,
        field: 'userId' // optional, if not specified it will generate a specific field.
    }
});
```

This is how we setup the links. You have two ways of actually linking the comment to the user.

Simply update 'userId' field.

```javascript
Comments.insert({
    text: 'Our first linked comment, 
    userId: this.userId
});
```

Use the *getLink* method. 

Note: This feels like an overkill at this stage, but later we will understand why this is sometimes a better approach.

```javascript
const commentId = Comments.insert({text: 'Our first linked comment.'});
const userLink = Comments.getLink(commentId, 'user'); 
// if you have the comment object, you can also do Comments.getLink(comment, 'user')
userLink.set(this.userId);  // will update userId
userLink.unset(); // will make userId null
// set/unset makes an update immediately into the database, should be run server side.
```


Inversed Links
--------------

All good but I may want at the user level to get all my comments I posted. This is where we introduce the concept of *inversed* links.
An inversed link basically means that the information about the link is stored on the other side. In our case, in the Comment document.

Note: you will not be able to perform linking actions in the inversed link, only fetching. Actions such as set/unset or add/remove must be done in the link.

```javascript
Users.addLinks({
    'comments': {
        collection: Comments,
        inversedBy: 'user'
    }
});

let comments = [];
const commentsLink = Users.getLink(this.userId, 'comments');
comments = commentsLink.find().fetch()
// or
comments = commentsLink.fetch()
// or filter your query even more using find(filters, options)
comments = commentsLink.find({text: 'Our first linked comment.'}, {limit: 10}).fetch()
// or
comments = commentsLink.fetch({text: 'Our first linked comment.'}, {limit: 10})
```

We have different ways of handling fetching, most of the times you will just use .fetch() and that's it.

Now, the comment might have different tags. So we are going to use a *many* relationship
```javascript
Comments.addLinks({
    tags: {
        collection: Tags,
        type: 'many'
    }
})

const commentLink = Comments.getLink(commentId, 'tags');
commentLink.add(tagId);
// or
commentLink.add(tagObject);
// or
commentLink.add([tagId1, tagId2]);
// or
commentLink.add([tagObject1, tagObject2]);

// and for removing it accepts the same kind of arguments
commentLink.remove(tagId1);
```

Meta Links
----------

A meta relationship is very useful because you may need to store information about the relationship. 
Such as an user can belong to certain groups, but he isAdmin only to some groups. 
So instead of creating a separate collection for this. We'll use meta relationships.

```javascript
Users.addLinks({
    groups: {
        type: 'many'
        metadata: {}
    }
});

const groupsLink = Users.getLink(userId, 'groups');
groupsLink.add(groupId, {isAdmin: true});

groupsLink.metadata(groupId) // returns {isAdmin: true, _id: groupId}}
groupsLink.metadata(groupId, {isAdmin: false}) // runs the update for you automatically
```

The same principles apply to "One-Meta" relationships.
```javascript
Users.addLinks({
    group: {type: 'one', metadata: {}}
})

const groupLink = Users.getLink(userId, 'group');
groupLink.set(groupId, {isAdmin: true});
groupLink.metadata() // returns {isAdmin: true, _id: groupId}}
groupLink.metadata({isAdmin: false}) // runs the update for you automatically
```


Resolver Links
--------------

Note: Resolver links do not work with reactive queries (publish/subscribe) but work really well with static queries.


```javascript
Users.addLinks({
    ticket: {
        resolver(user, arg1, arg2) {
            const runner = Meteor.wrapAsync(HTTP.call);
            return runner("GET", "https://api.example.com/tickets", {id: user.exampleApiId});
        }
    }
});

const ticketLink = Users.getLink(this.userId, 'tickets');
ticketsLink.fetch(arg1, arg2);
```

Note: arguments are just to illustrate the fact that you can use them.
Note: you must use a sync function for this to work. Read more about Meteor.wrapAsync.

Hint: You can also use resolver for special queries for example, you may need to get only the messages that he has not seen yet.

```javascript
Users.addLinks({
    unreadMessages: {
        resolver(user) {
            return Messages.find({receiverId: user._id, isRead: false}).fetch();
        }
    }
});
```

Integration with SimpleSchema
-----------------------------

It is very likely that you would use SimpleSchema to ensure a data-structure for your documents, and prevent bad data to be inserted.
This library automatically detects whether you have a schema attached to your collection or not, and will add fields with proper schema definitions.

Note: in order for this to work, make sure your schema is attached before defining links.

Appended schemas:

1. One Relationships
{
    [fieldName]: {type: String}
}

2. Many Relationships
{
    [fieldName]: {type: String}
}

3. Meta Relationships

For metadata it gets very interesting because you have the ability to specify the schema in the link definition.

Example:
```
Users.addLinks({
    group: {type: 'one', field: 'groupId', metadata: {}}
});
```

This will append to your schema:
```
{
    groupId: {
        type: Object,
        blackbox: true, 
        optional: true
     }
}
```

```
Users.addLinks({
    group: {
        type: 'one', 
        field: 'groupId', 
        metadata: {
            isAdmin: {type: Boolean, optional: true}
        }
    }
});
```

// This will append to your schema:
```
{
    groupId: {
        type: Object,  
        optional: true
    },
    groupId.$._id: {type: String}
    groupId.$.isAdmin: {type: Boolean, optional: true}
}
```

// Same goes for many-meta, it will create a similar schema to the one above, but it will wrap it in [] so it does what exactly what we want.


Data consistency
----------------
If you specify a virtual link in a Collection. If that document is removed. The inversed relationship link will be removed.
Let's go back to our first example.

```
Users.addLinks({
    'comments': {
        collection: Comments,
        inversedBy: 'user'
    }
});
```

When a user is removed from database. It will go through all the comments, and unset() it from everywhere. This goes for all types of relationships.
And it basically ensures that you will not have references to non-existing elements.

In order for this to work you must define the *inversed link* in the collection.