# GraphQL Bridge

We strongly recommend installing [`cultofcoders:apollo`](https://github.com/cult-of-coders/apollo) package, which makes it super easy to get your barebones Meteor app up with Grapher & GraphQL Services.

## Creating your Queries

The 4th argument that we receive inside the resolver, is the AST (Abstract Source Tree), which represents the query we receive. Based on that information, we can extract the Grapher's body, and we also added some very useful options, to enable security and customisation.

```js
const Query = {
    users(_, args, context, ast) {
       return Users.astToQuery(ast, {
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
        }).fetch();
    }
}
```

## Mapping Fields

There may be scenarios where your database field is different from the field in the API you expose, Grapher treats that easily by exposing an `addFieldMap` function:

```js
Users.addFieldMap({
    createdAt: 'created_at',
});
```

Meaning that the body received from GraphQL is going to properly handle the situation. What happens behind, basically, we create a reducer for that field.

## Global Config

Setting global defaults for all `astToQuery` manipulations:

```js
import { setAstToQueryDefaults } from 'meteor/cultofcoders:grapher';

setAstToQueryDefaults({
    maxLimit: 100,
    maxDepth: 5,
});
```

## Resolver's Context

```js
import { db } from 'meteor/cultofcoders:grapher';

// Inject db in your context
// And you can do
const resolvers = {
    Query: {
        users(_, args, ctx, ast) {
            const query = db.users.astToQuery(ast);

            return query.fetch();
        },
    },
};
```

## GraphQL Directives

It would be nice if we could configure our directives directly inside GraphQL right? Something like this:

```js
type User @mongo(name: "users") {
    comments: [Comment] @link(to: "user")
}

type Comment @mongo(name: "comments") {
   user: User @link(field: "userId")
   post: Post @link(field: "postId")
   createdAt: Date @map("created_at")
}

type Post @mongo(name: "posts") {
    comments: [Comment] @link(to: "post")
}
```

Find out more here: https://github.com/cult-of-coders/grapher-schema-directives
