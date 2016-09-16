Collection Exposure
===================

In order to use *Collection.createQuery* client-side and fetch it or subscribe to it. You must expose it server side.

```javascript
// server side.
Collection.expose();

// or with a custom firewall
Collection.expose((filters, options, userId) => {
    if (!isAnAdmin(userId)) {
        filters._id = userId;
    }
    // you also have control over options, if you may need to control the limits of data fetching.
});

Collection.findSecure(filters, options, userId) // if userId !== undefined, it will apply the firewall.
```

Exposing a collection does the following things:

- Creates a method called: exposure_{collectionName} which accepts a query
- Creates a publication called: exposure_{collectionName} which accepts a query and uses [reywood:publish-composite](https://atmospherejs.com/reywood/publish-composite) to achieve reactive relationships.
- If firewall is specified, it extends collection with a method called *findSecure* in which the firewall is executed if specified.

Note: If userId is undefined, firewall will not be applied. if userId is null or String, it will be applied.
The reason for this is because on server-side you may not want this restriction when fetching a query.

When using the query, if the nested collections are exposed (have a findSecure method), then the firewall will be applied.

In the exposed method and publication userId is passed when recursively fetching (or composing) the data.
If the user is not logged in, *userId* is null.

Example
-------

```javascript
Users.expose((filters, options, userId) => {
    if (!isAnAdmin(userId)) {
        filters._id = userId;
    }
});

Comments.expose((filters, options, userId) => {
    if (!isAnAdmin(userId)) {
        filters.userId = userId;
        filters.isPrivate = false;
    }
});
```

Doing a query as a non-admin (Client Side):

```javascript
const query = Users.createQuery({
    comments: {
        $filters: {isPrivate: true}
    }
});

query.fetch((err, res) => {
    // res will contain only isPrivate: false comments because the firewall will override the filters.
});
```

However, if you do it server side:
```javascript
const data = query.fetch() // will not care about the firewall at all.
```


### Next step

[Read about Query](exposure.md)