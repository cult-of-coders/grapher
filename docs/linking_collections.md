# Linking Collections

Let's learn what type of links we can define between collections, and what is the best way to do them.

First, we begin with an illustration of the power of Grapher.

Let's assume our `posts` collection, contains a field, called `authorId` which represents an actual `_id` from `Meteor.users`,
if you wanted to get the post and the author's name, you had to first fetch the post, and then get the author's name based on his `_id`.

```js
Meteor.methods({
    getPost({postId}) {
        let post = Posts.findOne(postId, {
            fields: {
                title: 1,
                createdAt: 1,
                authorId: 1,
            }
        });
        
        if (!post) { throw new Meteor.Error('not-found') }
        const author = Meteor.users.findOne(post.authorId, {
            fields: {
                firstName: 1,
                lastName: 1
            }
        });
        
        Object.assign(post, {author});
        
        return post;
    }
})
```

With Grapher, your code above is transformed to:

```js
Meteor.methods({
    getPost({postId}) {
        let post = Posts.createQuery({
            $filters: {_id: postId},
            title: 1,
            createdAt: 1,
            author: {
                firstName: 1,
                lastName: 1
            }
        });
        
        return post.fetchOne();
    }
})
```

This is just a simple illustration, imagine the scenario, in which you had comments,
and the comments had authors, and you needed their avatar. Your code can easily
grow very large, and it's going to be hard to make it performant.

## A basic link

To define the link illustrated in the example above, we create a separate `links.js` file that is 
imported separately outside the collection module. We need to define the links in their own module,
after all collections have been defined, because there will be situations where, when you define the links
where you define the collection, 2 collections import each other, leading to some strange behaviors.

```js
// file: /imports/db/posts/links.js
import Posts from '...';

Posts.addLinks({
    'author': {
        type: 'one',
        collection: Meteor.users,
        field: 'authorId',
    }
})
```

You created the link, and now you can use the query illustrated above. 
We decided to choose `author` as a name for our link and `authorId` the field to store it in, but it's up to you to decide this.

## Inversed links

Because we linked `Posts` with `Meteor.users` it means that we can also get all `posts` of an user.
Because in a way `Meteor.users` is also linked with `Posts` but an `inversed` way. We refer to it as an `Inversed Link`.

```js
// file: /imports/db/users/links.js
import Posts from '...';

Meteor.users.addLinks({
    'posts': {
        collection: Posts,
        inversedBy: 'author'
    }
})
```

`author` represents the link name that was defined inside Posts. Defining inversed links allows us to do:

```js
Meteor.users.createQuery({
    posts: {
        title: 1
    }
})
```

## One and Many

Above you've noticed a `type: 'one'` in the link definition, but let's say we have a `Post` that belongs to many `Categories`,
which have their own collection into the database. This means that we need to relate with more than a single element.

```js
// file: /imports/db/posts/links.js
import Posts from '...';
import Categories from '...';

Posts.addLinks({
    'categories': {
        type: 'many',
        collection: Categories,
        field: 'categoryIds',
    }
})
```

In this case, `categoryIds` is an array of strings (`[categoryId1, categoryId2, ...]`), each string, representing `_id` from `Categories` collection.

Let's also create an inversed link from `Categories`, so you can use it inside the `query`

```js
// file: /imports/db/posts/links.js
import Categories from '...';
import Posts from '...';

Categories.addLinks({
    'posts': {
        collection: Posts,
        inversedBy: 'categories'
    }
})
```

By defining this, I can query for a category, and get all the posts it has.

## Meta Links

We use a `meta` link when we want to add additional data about the relationship. For example,
a user can belong in a single `Group`, but we need to also store when he joined that group and what roles he has in it.

```js
// file: /imports/db/users/links.js
import Groups from '...'

Meteor.users.addLinks({
    group: {
        type: 'one',
        collection: Groups,
        field: 'groupLink',
        metadata: true,
    }
})
```

Notice the new option `metadata: true` this means that `groupLink` is no longer a `String`, but an `Object` that looks like this:

```
// inside a Meteor.users document
{
    ...
    groupLink: {
        _id: 'XXX', // This is the _id of the group
        roles: 'ADMIN',
        createdAt: Date,
    }
}
```

Let's see how this works out in our query:

```js
const user = Meteor.users.createQuery({
    $filters: {_id: userId},
    group: {
        name: 1,
    }
}).fetchOne()
```

`user` will look like this:

```
{
    _id: userId,
    group: {
        $metadata: {
            roles: 'ADMIN',
            createdAt: Date
        },
        name: 'My Funky Group'
    }
}
```

We store the metadata of the link inside a special `$metadata` field. And it works from inversed side as well:

```js
Groups.addLinks({
    users: {
        collection: Meteor.users,
        inversedBy: 'group'
    }
});
```

```js
const group = Groups.createQuery({
    $filters: {_id: groupId},
    name: 1,
    users: {
        firstName: 1,
    }
}).fetchOne()
```

`group` will look like:
```
{
    _id: groupId,
    name: 'My Funky Group',
    users: [
        {
            $metadata: {
                roles: 'ADMIN',
                createdAt: Date
            },
            _id: userId,
            firstName: 'My Funky FirstName',
        },
        ...
    ]
}
```

The same principles apply to `meta` links that are `type: 'many'`, if we change that in the example above. 
The storage field will look like:

```
{
    groupLinks: [
        {_id: 'groupId', roles: 'ADMIN', createdAt: Date},
        ...
    ]
}
```

The same principles above apply, we still store `$metadata` field.

I know what question comes to your mind right now, what if I want to put a field inside the metadata,
which represents an id from other collection, like I want to store who added that user (`addedBy`) to the group.

No-one stops you from storing it as a string, but if this is one of Grapher's current limitations, it can't fetch
links that are inside the metadata.

But Grapher makes you think relational again, and you can abstract it to another collection:

```js
// file: /imports/db/groupUserLinks/links.js
import Groups from '...';
import GroupUserLinks from '...';

// file: /imports/db/users/links.js
Meteor.users.addLinks({
    groupLink: {
        collection: GroupUserLinks,
        type: 'one',
        field: 'groupLinkId',
    }
})

GroupUserLinks.addLinks({
    user: {
        collection: Meteor.users,
        inversedBy: 'groupLink',
    },
    adder: {
        type: 'one',
        collection: Meteor.users,
        field: 'addedBy'
    },
    group: {
        type: 'one',
        collection: Meteor.users,
        field: 'groupId'
    }
})
```

And the query will look like this:
```js
Meteor.users.createQuery({
    groupLink: {
        group: {
            name: 1,
        },
        adder: {
            firstName: 1
        },
        roles: 1,
        createdAt: 1,
    }
})
```

## Link Loopback

No one stops you from linking a collection to itself, say you have a list of friends which are also users:

```js
Meteor.users.addLinks({
    friends: {
        collection: Meteor.users,
        type: 'many',
        field: 'friendIds',
    }
});
```

Say you want to get your friends, and friends of friends, and friends of friends of friends!
```js
Meteor.users.createQuery({
    $filters: {_id: userId},
    friends: {
        nickname: 1,
        friends: {
            nickname: 1,
            friends: {
                nickname: 1,
            }
        }
    } 
});
```

## Uniqueness

The `type: 'one'` doesn't necessarily guarantee uniqueness from the inversed side.

For example, we have `Comments` and `Posts` linked, by defining a `one` link from Comments to Posts,
and an inversed link from Posts to Comments.

When you fetch comments, from posts, the inversed side, they will return an array.

But if you want to have a `OneToOne` relationship, and you want Grapher to give you a single object in return,
you can do:

```js
Meteor.users.addLinks({
    paymentProfile: {
        collection: PaymentProfiles,
        inversedBy: 'user'
    }
});

PaymentProfiles.addLinks({
    user: {
        field: 'userId',
        collection: Meteor.users,
        type: 'one',
        unique: true
    }
})
```

Now fetching:
```js
Meteor.users.createQuery({
    paymentProfile: {
        type: 1,
        last4digits: 1,
    } 
});
```

`paymentProfile` inside `user` will be an object because it knows it should be unique.

## Data Consistency

We clean out leftover links from deleted collection items.

Let's say I have a `Threads` collection with some `memberIds` linked to `Meteor.users`. 

If a `user` is deleted from the database, we don't want to keep unexisting references. 
So after we delete a user, all threads containing that users should be cleaned.

This is done automatically by Grapher so you don't have to deal with it.

The only rule is that `Meteor.users` collection needs to have an inversed link to `Threads`.
In conclusion, if you want to benefit of this, you have to define inversed links for every direct links.

## Autoremoval

```js
Meteor.users.addLinks({
    'posts': {
        collection: Posts,
        inversedBy: 'author',
        autoremove: true
    }
});
```

After you delete a user, all the links that have `autoremove: true` will be deleted.

This works from the `direct` side as well, not only from `inversed` side. 

Please use with caution, sometimes it's better to explicitly delete it, but there will be situations,
where you don't care and this makes your code cleaner.

## Indexing

As a rule of thumb, you must index all of your links. Because that's how you achieve absolute performance.

This is not done by default, to allow the developer flexibility, but you can do it simply enough from the direct side definition of the link:

```js
PaymentProfiles.addLinks({
    user: {
        field: 'userId',
        collection: Meteor.users,
        type: 'one',
        unique: true,
        index: true,
    }
})
```

The index is applied only on the `_id`, meaning that if you have `meta` links, other fields present in that object will not be indexed,
but you can run a `Collection._ensureIndex` separately.

If you have `unique: true` set, the index will also apply a unique constraint to it.

## Top Level vs Nested Fields

Grapher supports both top level and nested fields for storing linking data.
Top level fields are **recommended** because we believe developer should think relational and 
eliminate large and complex documents by abstracting them into collections.

Support for nested fields is here only for cases where no other solution is possible, for example when working with
other packages that require you to store your data inside an object.

## Conclusion

Using these simple techniques, you can create a beautiful database schemas inside MongoDB that are relational and very simple to fetch,
you will eliminate almost all your boilerplate code around this and allows you to focus on more important things.

## [Continue Reading](linker_engine.md) or [Back to Table of Contents](index.md)









