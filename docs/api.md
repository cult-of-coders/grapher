# API

Use this as a cheatsheet after you have read the full documentation.

*   [Adding Links](#adding-links)
*   [Adding Reducers](#adding-reducers)
*   [Creating GraphQL Queries](#creating-graphql-queries)
*   [Creating Named Queries](#creating-named-queries)
*   [Exposing Named Queries](#exposing-named-queries)
*   [Using Queries](#using-queries)
*   [Caching Named Queries](#caching-named-queries)
*   [Creating Global Queries](#creating-global-queries)
*   [Exposing Global Queries](#exposing-global-queries)

### Adding Links

```js
Collection.addLinks({
    linkName: {
        collection, // Mongo.Collection
        type, // 'one' or 'many'
        metadata, // Boolean
        field, // String
        index, // Boolean, whether to index your collections
        denormalize: {
            field, // String
            body, // Body from related collection
        },
    },
});

Collection.addLinks({
    linkName: {
        collection, // Mongo.Collection
        inversedBy, // The link name from the other side
        denormalize: {
            field, // String
            body, // Body from related collection
        },
    },
});
```

### Adding Reducers

```js
Collection.addReducers({
    reducerName: {
        body, // Object, dependency graph
        compute(object) {
            // anything
        },
    },
});
```

### Creating Named Queries

```js
Collection.createQuery(
    'queryName',
    {
        $options, // Mongo Options {sort, limit, skip}
        $filters, // Mongo Filters
        $filter({ filters, options, params }) {}, // Function or [Function]
        $postOptions, // {limit, sort, skip}
        $postFilters, // any sift() available filters
        $postFilter(results, params) {}, // Function => results, or [Function] => results
        body, // The query body
    },
    {
        params, // Default parameters
        validateParams, // Object or Function
    }
);
```

### Creating GraphQL Queries

```js
const Query = {
    users(_, args, context, ast) {
        const query = Users.astToQuery(ast, {
            // Manipulate the transformed body
           embody({body, getArgs}) {}

           $filters, // Mongo Filters/Selector
           $options, // Mongo Options

           // It will only allow you to query against this body graph
           // Meaning it won't allow fields outside, links outside, or deeper nested than the ones you specify
           intersect: Body,

           // Useful when you don't have an intersection body, to restrict the limit of depth, to avoid a nested GraphQL attack
           maxDepth,

           // Automatically enforces a maximum number of results
           maxLimit, // Integer

           // Simply removes from the graph what fields it won't allow
           // Can work with deep strings like 'comments.author'
           deny, // String[]
        })

        return query.fetch();
    }
}
```

Setting global defaults for all `astToQuery` queries:

```js
import { setAstToQueryDefaults } from 'meteor/cultofcoders:grapher';

setAstToQueryDefaults({
    maxLimit: 100,
    maxDepth: 5,
});
```

Getting the db context to inject it:

```js
import { db } from 'meteor/cultofcoders:grapher';

// db.users
// db.posts
// db.${collectionName}
```

Checkout [https://github.com/cult-of-coders/grapher-schema-directives](https://github.com/cult-of-coders/grapher-schema-directives) for some Grapher directives.

### Exposing Named Queries

```js
query.expose({
    firewall(userId, params) {}, // Function or [Function]
    method, // Boolean
    publication, // Boolean
    unblock, // Boolean
    validateParams, // Function or Object
    embody, // Object which extends the body server-side securely, or Function(body, params)
});
```

### Creating and Exposing Resolvers

```js
// both
const query = createQuery('queryName', () => {});

// server
query.expose({
    firewall, // Function or [Function]
});

query.resolve(function(params) {
    // this.userId
    return [];
});
```

### Using Queries

```js
query.setParams({}); // extends current params
```

#### Server-Side

```js
query.clone({ params }).fetch();
query.clone({ params }).fetchOne();
query.clone({ params }).getCount();
```

#### Client-Side

Static:

```js
query.clone({ params }).fetch((err, res) => {});
query.clone({ params }).fetchOne((err, res) => {});
query.clone({ params }).getCount((err, res) => {});
```

Reactive:

```js
const query = userListQuery.clone({ params });

const handle = query.subscribe(); // handle.ready()
const data = query.fetch();
const oneData = query.fetchOne();

const handleCount = query.subscribeCount();
const count = query.getCount();
```

#### Caching Named Queries

```js
import { MemoryResultCacher } from 'meteor/cultofcoders:grapher';

// server-side
query.cacheResults(
    new MemoryResultCacher({
        ttl: 60 * 1000, // 60 seconds
    })
);
```

#### Creating Global Queries

```js
Collection.createQuery({
    $options, // Mongo Options {sort, limit, skip}
    $filters, // Mongo Filters
    $filter({ filters, options, params }) {}, // Function or [Function]
    $postOptions, // {limit, sort, skip}
    $postFilters, // any sift() available filters
    $postFilter, // Function => results, or [Function] => results
    body, // the rest of the object
});
```

#### Exposing Global Queries

```js
Collection.expose({
    firewall(filters, options, userId) {}, // Function or [Function]
    publication, // Boolean
    method, // Boolean
    blocking, // Boolean
    maxLimit, // Number
    maxDepth, // Number
    restrictedFields, // [String]
    restrictLinks, // [String] or Function,
    body, // Object or Function(userId) => Object
});
```
