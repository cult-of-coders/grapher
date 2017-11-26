## Migrations

### From 1.2 to 1.3

SimpleSchema has been completely removed and it will no longer extend your Collection's schema automatically, therefore,
if you have configured links you have to manually add them.

The `metadata` link configuration is no longer an object, but a `Boolean`

```js
// no longer working
Users.addLinks({
    profile: {
        collection: Profiles,
        metadata: {
            createdAt: {type: Date}
        }
    }
})
```
=>
```js
// working
Users.addLinks({
    profile: {
        collection: Profiles,
        metadata: true
    }
})
```

`createNamedQuery` has been removed, use `createQuery` instead:

```js
// no longer working
createNamedQuery('xxx', {});

// working
createQuery('xxx', {});
```