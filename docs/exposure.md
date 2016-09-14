Collection Exposure
===================

In order to use createQuery client-side and fetch it or subscribe to it. You must expose it server side.

```javascript
Collection.expose();
// or
Collection.expose((filters, options, userId) => {
    if (!isAnAdmin(userId)) {
        filters._id = userId;
    }
    // you also have control over options, if you may need to control the limits of data fetching.
});
```

Exposing a collection does the following things:

- Creates a method called: exposure_{collectionName} which accepts a query
- Creates a publication called: exposure_{collectionName} which accepts a query
- If firewall is specified, it extends collection with a method called findSecure in which the firewall is executed if specified.

Note: if userId is undefined, firewall will not be applied. if userId is null or String, it will be applied.
The reason for this is because on server-side you may not want this restriction when fetching a query.

When using a query, if the nested collections are exposed, when we search them the firewall will be applied.

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