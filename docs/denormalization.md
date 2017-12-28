# Denormalization

Grapher allows you to denormalize your links, leveraging the power of `herteby:denormalize` package.
You can learn more about its capabilities here: https://github.com/Herteby/denormalize

You may need denormalization in such cases where:
1. You want to avoid another database fetch 
2. You need ability to perform complex filtering


A simple example, a user has an avatar that is stored in the image collection:

```js
// Assuming Images of schema: {_id, path, smallThumbPath, createdAt}
import Images from '...';

Meteor.users.addLinks({
    avatar: {
        collection: Images,
        field: 'avatarId',
        type: 'one',
        denormalize: {
            field: 'avatarCache', // in which field to store the cache
            // what fields to cache from Images, this only works for fields and not links
            body: { 
                path: 1,
                smallThumbPath: 1,
            }
        }
    }
})
```

If you did not add this since the beginning of your app, you need to add this into your migration script:

```js
import {migrate} from 'meteor/herteby:denormalize'
migrate('users', 'avatarCache');
```

Now if you are doing the following query:
```js
const user = Meteor.users.createQuery({
    avatar: {
        smallThumbPath: 1,
    }
}).fetchOne()
```

Grapher will check to see if avatar's body is a subbody of the denormalized body. If yes, it will hit the `avatarCache` field,
leading to a single database request.

And the result will in the form as you expect:
```
{
    _id: 'XXX',
    avatar: {
        _id: 'YYY',
        smallThumbPath: '/path/to/file.small.png'
    }
}
```

It works very well with nested fields, so you don't have to worry about that.

However, a query like this:
```js
const user = Meteor.users.createQuery({
    avatar: {
        smallThumbPath: 1,
        createdAt: 1,
    }
}).fetchOne()
```

Will result in a subsequent database request, because `createdAt` is not in the denormalized body. But if you replace `createdAt` with `path` then it will hit the cache.

When the user sets a new Avatar, or the `Image` object of that Avatar gets updated. The cache gets automatically updated,
so you don't have to worry about anything. It's magical.

Denormalization works with any type of links `one`, `many`, `meta` whether they are `direct` or `inversed`.

We previously tackled the case where we needed `$postFilters` or `$postFilter` to retrieve filtered data.

For example, let's say we want to retrieve only the users that have reviewed a book of a certain type, 
and inside `users` collection we have a `reviewedBooks` link.

```js
Meteor.users.addLinks({
    'reviewedBooks': {
        type: 'many',
        collection: Books,
        field: 'reviewedBookIds',
        denormalize: {
            body: {
                type: 1,
            },
            field: 'reviewedBooksCache',
        }
    }
})

Books.addLinks({
     'reviewers': {
         collection: Meteor.users,
         inversedBy: 'reviewedBooks',
     }
});
```

And now, I want to get all the users that have reviewed books of type `Drama`, because I want
to send them an email about a new book, or a soap opera.

```js
const dramaticUsers = Meteor.users.createQuery({
    $filters: {
        'reviewedBooksCache.type': 'Drama'
    },
    email: 1,
}).fetch();
```

That was it, but denormalization comes with a price:
1. It adds hooks to the database so it can properly update it, therefore a change somewhere can result
into additional computation.
2. If you are not careful it can lead to very big caches, which is not what you want unless you favor performance over storage.

The `herteby:denormalize` package also supports caching fields and caching counts. 
You can define those caches outside Grapher without a problem, and specify those fields in your query.

## Caution

If you want to use deep filters, it will not work with denormalized cache, you can use `$postFilter()` method for that.

```js
{
    users: {
        avatar: {
            $filters: {} // will not hit the cache
        }
    }
}
```

Because if you put `$filters: {}` inside the body of the cache, it will regard it as a foreign field, and it will 
fetch the linked Collection for it, falling back to the original behavior.

A current limitation for denormalized meta links, is that we will no longer be able to store the `$metadata` inside the nested object, because that
would require additional fetching of the link storage if we are querying the graph from the inversed side.

## Conclusion

Using denormalization can enable you to do wonderful things inside NoSQL, but also be careful because they come with a cost,
that may not be very noticeable in the beginning. But can also dramatically improve performance at the same time.

I suggest that they should be used to cache things that rarely change such as an user's avatar, or when you need to do
powerful and frequent searches, that otherwise would have consumed more resources.

## [Continue Reading](caching_results.md) or [Back to Table of Contents](index.md)
