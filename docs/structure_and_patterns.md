# Structure and Patterns

These are a set of recommended ways to handle things, they do not enforce
anything.

We suggest you read: http://www.meteor-tuts.com/chapters/3/persistence-layer.html first.

- Store queries inside `/imports/api` under their own module and proper path (eg: `/imports/api/users/queries/getAllUsers.js`)
- Store `links.js` files inside `/imports/db` close to their collections definitions. (eg: `/imports/db/users/links.js`)
- Create a an `/imports/db/index.js` that imports and exports all your collections
- In `/imports/db/links.js` which imports all links from collections (eg: `import ./posts/links.js`)
- In that `/imports/db/index.js` also `imports './links'` after you imported all collections.
- Make sure you import `/imports/db/index.js` in both client and server environments.
- For Named Queries, keep `query.js` and `query.expose.js` separated.
- Create an `/imports/api/exposures.js` that imports all `.expose.js` files, and import that server-side.
- When you import your queries suffix their with `Query`
- Always `.clone()` modular queries before you use them client and server-side
- Store reducers inside `links.js`, if the file becomes too large (> 100 lines), separate them.
- Store server-side reducers inside `/imports/api` - as they may contain business logic

If you respect the patterns above you will avoid having the most common pitfalls with Grapher:

**Reducer/Links not working?**

Make sure they are imported in the environment you use them client/server.

**My link is not saved in the database?**

Make sure you added it correctly to your SimpleSchema, if you have that.

## Fragments

You will find yourself requiring often same fields for users, such as `email`, `fullName`, and maybe `avatar`.

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
import {compose} from 'meteor/cultofcoders:grapher';

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

`compose()` uses deep extension, so it works how you expect it to work, especially if some fragments have shared bodies.

Do not use special properties inside fragments, such as `$filters`, `$options`, etc.

## Scaling Reactivity

If you want to have highly scalable reactive data graphs, think about moving from tailing MongoDB oplog to RedisOplog:
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

Or, if you don't want to expose that, embody the `$filter()` server-side:

```js
// query.expose.js
query.expose({
    embody: {
        $filter({options, filters, params}) {
            filters.threadId = params.threadId;
            options.namespace = `thread::${params.threadId}`;
        }
    }
})
```

Note that `embody` can also be a function:
```js
// query.expose.js
query.expose({
    embody(body, params) {
        // Modify body here
    }
})
```

## Conclusion

Using some simple techniques we can make our code much easier to read, and we can make use of a scalable data graph using `redis-oplog`

## [Continue Reading](outside_meteor.md) or [Back to Table of Contents](index.md)