# Caching Results

Grapher is already performant enough to remove this necessity, but what if we want
to squeeze even more performance? What can we do? We cache'em up.

Caching results only works for Named Queries.

Let's say we have some very heavy queries, that do complex sorting
and complex filtering:

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
inside the database. And you just want to look for your friends in this big world.

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
   ttl: 60 * 1000, // 1 minute caching
});

myFriendsQuery.cacheResults(cacher);
```

That's it. If there is no cache, it fetches the database and stores the result in memory, and after 60s it clears the cache.
Any other calls done in between this time, will hit the cache.

The caching is done by serializing the params and prefixed by query name, in our case, the cache id looks like:
```
myFriendsEmails{userId:"XXX"}
count::myFriendsEmails{userId:"XXX"}
```

The cacher will be used regardless if you are on server or on the client.
The cacher also works with counts. When you use `query.getCount()`

## Implementing your own

The cacher that you provide exposes: 
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

/**
 * Redis Cacher
 */
export default class RedisCacher extends BaseResultCacher {
    // this is the default one in case you need to override it 
    generateQueryId(queryName, params) {
        return `${queryName}::${EJSON.stringify(params)}`;    
    }
    
    // in case of a count cursor cacheId gets prefixed with 'count::'
    fetch(cacheId, fetchables) {
        const {client, ttl} = this.config;
        
        const cacheData = client.get(cacheId);
        if (cacheData) {
            return EJSON.parse(cacheData);
        }

        const data = BaseResultCacher.fetchData(fetchables);
        client.set(cacheId, data, 'PX', ttl);

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

As you may have guessed, this works with resolver queries as well, in their case, instead of the actual query,
we pass as `query` parameter an interface containing `fetch()`.

And your cacher, will never receive `cursorCount` inside the `fetchables` object.

Therefore you can use the same paradigms for your cache for resolver queries as well.


## Invalidation

Unfortunately, if you want to invalidate your cache you can do it yourself manually, as this is not implemented,
but since you can hook in your own cacher, you can do whatever you want.

## [Conclusion](table_of_contents.md)

If you have very heavy and frequent requests to the database, or any type of requests (resolver queries) you can think
about using a cache. 









