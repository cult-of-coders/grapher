## Migrations

### From 1.x -> 2.0 (Meteor 3.0)

- Static queries on frontend must use `query.fetchAsync()` instead of `query.fetch(cb)`. `query.fetch()` worked with reactive and static queries before, but now we have to use `Meteor.callAsync()` instead of `Meteor.call()` so underlying `_fetchStatic` method returns a Promise for static queries.

- Server-side queries should use `fetchAsync`, `fetchOneAsync` and `countAsync` instead of their synchronous counterparts.

### From 1.3.5 -> 1.3.6

When you use reducers with a body that uses a link that should return a single result, you will now get the object, not an array with a single element.

### From 1.2 to 1.3

SimpleSchema has been completely removed and it will no longer extend your Collection's schema automatically, therefore, if you have configured links you have to manually add them.

For example the following link:

```js
Users.addLinks({
  post: {
    type: 'one',
    collection: Posts,
    field: 'postId',
  },
});
```

Requires the respective field in your Collection's schema:

```js
// schema for Users
SimpleSchema({
  postId: {
    type: String,
    optional: true,
  },
});
```

The `metadata` link configuration is no longer an object, but a `Boolean`

```js
// no longer working
Users.addLinks({
  profile: {
    collection: Profiles,
    metadata: {
      createdAt: { type: Date },
    },
  },
});
```

=>

```js
// working
Users.addLinks({
  profile: {
    collection: Profiles,
    metadata: true,
  },
});
```

`createNamedQuery` has been removed, use `createQuery` instead:

```js
// no longer working
createNamedQuery('xxx', {});

// working
createQuery('xxx', {});
```

If you used `$postFilter` in your queries, rename it to `$postFilters`

If you used resolver links, migrate to reducers.
