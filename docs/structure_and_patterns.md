# Structure and Patterns

These are a set of recommended ways to handle things, they do not enforce
anything.

We suggest you read: http://www.meteor-tuts.com/chapters/3/persistence-layer.html first.

1. Store queries inside `/imports/api` under their own module and proper path.
2. Store `links` inside `/imports/db` along their collections definitions.
3. Create a an `/imports/db/index.js` that imports and exports all your collections
4. In `/imports/db/links.js` import all links from collections (`/imports/db/posts/links.js`)
5. In that `/imports/db/index.js` also `imports './links'` after you imported all collections.
6. Make sure you import `/imports/db/index.js` in both client and server environments.
7. For Named Queries, keep `query.js` and `query.expose.js` separated.
8. Create an `/imports/api/exposures.js` that imports all `.expose.js` files, and import that server-side.
8. When you import your queries suffix their with `Query`
9. Always `.clone()` queries before you use them client and server-side
10. Store reducers inside `links.js`, if the file becomes too large (> 100 lines), separate them.

If you respect the patterns above you will avoid having the most common pitfalls with Grapher:

**Reducer/Links not working?**
Make sure they are imported in the environment you use them client/server.

**My link is not saved in the database**
Make sure you added it correctly to your SimpleSchema


## Fragments

You will find yourself requiring often same fields for Users, such as email, fullName, and maybe avatar.

For that let's create some fragments:
```js
// file: /imports/db/fragments/UserPublic.js
export default {
    fullName: 1,
    avatar: {
        path: 1,
    },
    email: 1,
}

// file: /imports/db/fragments/index.js
export {default as UserPublicFragment} from './UserPublicFields';
```

Now use it:
```js
import {UserPublicFragment} from '/imports/db/fragments';
Invoices.createQuery({
    number: 1,
    total: 1,
    user: {
        ...UserPublicFragment,
        billingInfo: {
            // etc
        }
    }
})
```

You can also compose certain fragments:

```js
import compose from 'meteor/cultofcoders:grapher';
import {
    UserPublicFragment,
    UserBillingFragment,
} from '/imports/db/fragments';

Invoices.createQuery({
    number: 1,
    total: 1,
    user: {
        ...compose(
            UserPublicFragment,
            UserBillingFragment
        )
    }
})
```

Compose uses a deep extension, so it works how you expected to work, especially if some fragments have shared bodies.

## Scaling Reactivity

If you want to have highly scalable reactive queries, think about moving from tailing MongoDB oplog to RedisOplog:
https://github.com/cult-of-coders/redis-oplog

Grapher is fully compatible with it. You can configure $options, inside the $filter() on to allow namespaced watchers.

Sample:

```js
export default Messages.createQuery('messagesForThread', {
    $filter({filters, options, params}) {
        filters.threadId = params.threadId;
        options.namespace = `thread::${params.threadId}`;
    },
    text: 1,
})
```


## Conclusion

This ends our journey through Grapher. We hope you enjoyed, and that you are going to use it.