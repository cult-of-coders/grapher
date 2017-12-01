# Caching Results

Ok, it's time for Grapher to take it to the next level. Let's cache our very heavy queries.

Caching results only works for Named Queries.


Let's take an example:

```js
export default Meteor.users.createQuery('myFriendsEmails', {
    $filter({filters, params}) {
        filters.friendIds = params.userId;
    },
    $options: {
        sort: {createdAt: -1}
    },
    email: 1,
})
```

Ok maybe it's not that complex or heavy, but use your imagination, imagine we have 100,000,000 users
inside the database. And you just want to look for your friends in this big nasty world.

```js
// server-side
import myFriendsQuery from '...';
import {MemoryResultCacher} from 'meteor/cultofcoders:grapher';

myFriendsQuery.expose({
    firewall(userId, params) {
        params.userId = userId;
    }
});

const cacher = new MemoryResultCacher({
   ttl: 60 * 1000, // 60 seconds caching
});

myFriendsQuery.cacheResults(cacher);
```

That's it. If there is no cache, it fetches the database and stores the result in memory, and after 60s it clears the cache.
Any other calls done in between this time, will hit the cache.

The cacher will be used regardless if you are on server or on the client.
The cacher also caches counts by default (eg: when you use `getCount()` from client or server)

**Cacher** is parameter bound, if you get the same parameters it will hit the cache (if it was already cached), 
the cache id is generated like this:
```
myFriendsEmails{userId:"XXX"}
count::myFriendsEmails{userId:"XXX"}
```

## Implementing your own

The cacher needs to be an object which exposes: 
```
fetch(cacheId, {
    query: {fetch()}, 
    countCursor: {count()}
})
generateQueryId(queryName, params)
```

If you want to roll-out your own cache that stores the data outside memory, and you want to share in your cloud,
you may want to use `redis` for that.

```js
import {BaseResultCacher} from 'meteor/cultofcoders:grapher';
import {EJSON} from 'meteor/ejson';

/**
 * Redis Cacher
 */
export default class RedisCacher extends BaseResultCacher {
    // the constructor accepts a config object, that stores it in this.config
    
    // this is the default one in case you need to override it 
    // if don't specify if it, it will use this one from BaseResultCacher
    generateQueryId(queryName, params) {
        return `${queryName}::${EJSON.stringify(params)}`;    
    }
    
    // in case of a count cursor cacheId gets prefixed with 'count::'
    fetch(cacheId, fetchables) {
        // client and ttl are the configs passed when we instantiate it
        const {client, ttl} = this.config;
        
        const cacheData = client.get(cacheId);
        if (cacheData) {
            return EJSON.parse(cacheData);
        }

        const data = BaseResultCacher.fetchData(fetchables);
        client.set(cacheId, EJSON.stringify(data), 'PX', ttl);

        return data;
    }
}
```

And use it:

```js
import RedisCacher from 'somewhere';

const cacher = new RedisCacher({
    client: redisClient,
    ttl: 60 * 1000
});

myFriendsQuery.cacheResults(cacher);
```

## Caching Resolver Queries

As you may have guessed, this works with [resolver queries](named_queries.md#resolvers) as well, in their case, instead of the actual query,
we pass as `query` parameter an interface containing `fetch()`.

And your cacher, will never receive `cursorCount` inside the `fetchables` object in this case.

Therefore you can use the same paradigms for your cache for resolver queries as well, without any change.

## Invalidation

Unfortunately, if you want to invalidate your cache you can do it yourself manually, as this is not implemented,
but since you can hook in your own cacher, you can do whatever you want.

## Conclusion

If you have very heavy and frequent requests to the database, or any type of requests (resolver queries) you can think
about using a cache, with very few lines of code.

## [Continue Reading](global_exposure.md) or [Back to Table of Contents](index.md)







