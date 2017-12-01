# Welcome to Grapher!

## The 3 Modules

Grapher is composed of 3 main modules, that work together:

#### Link Manager
This module allows you to configure relationships between collections and allows you to create denormalized links.

#### Query
The query module is used for fetching your data in a friendly manner, such as:
```js
createQuery({
    users: {
        firstName: 1
    }
})
```

It abstracts your query into a graph composed of Collection Nodes and Field Nodes.
it uses the **Link Manager** to construct this graph and if the fetching is done server-side (non-reactive queries),
it uses the **Hypernova Module** the crown jewl of Grapher, which heavily minimizes requests to database.

#### Exposure

The exposure represents the layer between your queries and the client, allowing you to securely expose your queries,
only to users that have access. 


## Let's begin!

You can use Grapher without defining any links, for example, let's say you have a method which returns a list of posts.

```js
const Posts = new Mongo.Collection('posts');

Meteor.methods({
    posts() {
        return Posts.find({}, {
            fields: {
                title: 1,
                createdAt: 1,
                createdBy: 1,
            }
        }).fetch();
    }
})
```

Transforming this into a Grapher query looks like this:

```js
Meteor.methods({
    posts() {
        const query = Posts.createQuery({
            title: 1,
            createdAt: 1,
            createdBy: 1,
        });
        
        return query.fetch();
    }
})
```

One of the advantages that Grapher has, is the fact that it forces you to specify the fields you need,
you may find this cumbersome in the beginning, but as your application grows, new fields are added,
fields that need to be protected, you'll find yourself refactoring parts of your code-base which exposed
all the fields.

If, for example, you want to filter or sort your query, we introduce the `$filters` and `$options` fields:

```js
Meteor.methods({
    posts() {
        // Previously Posts.find({isApproved: true}, {sort: '...', fields: '...'});
        const query = Posts.createQuery({
            $filters: {
                isApproved: true,
            },
            $options: {
                sort: {createdAt: -1}
            },
            title: 1,
            createdAt: 1,
            createdBy: 1,
        });
        
        return query.fetch();
    }
})
```

If for example you are searching an element by `_id`, you may have `$filters: {_id: 'XXX'}`, then instead of `fetch()` you
can call `.fetchOne()` so it will return the first element found.

`$filters` and `$options` are the ones supported by [Mongo.Collection.find()](http://docs.meteor.com/api/collections.html#Mongo-Collection-find)

## Dynamic $filter()

The nature of a query is to be re-usable. For this we introduce a special type of field called `$filter`,
which allows the query to receive parameters and adapt before it executes:

```js
// We export the query, notice there is no .fetch()

export default Posts.createQuery({
    $filter({filters, options, params}) {
    filters.isApproved = params.isApproved;
    },
    $options: {sort: {createdAt: -1}},
    title: 1,
    createdAt: 1,
    createdBy: 1,
});
```

The `$filter()` function receives a single object composed of 3 objects: `filters`, `options`, `params`.
The `filters` and `options` are initially what you provided in `$filters` and `$options` query, they will be empty
objects if they haven't been specified.

The job of `$filter()` is to extend/modify `filters` and `options`, based on params.

Lets see how we can re-use the query defined above:

```js
import postListQuery from '...';

Meteor.methods({
    posts() {
        return postListQuery.clone({
            isApproved: true
        }).fetch()
    }
})
```

Whenever we want to use a modular query, we have to `clone()` it so it creates a new instance of it.
The `clone()` accepts `params` as argument. Those `params` will be passed to the `$filter` function.

You can also use `setParams()` to configure parameters, which extends the current query parameters:

```js
import postListQuery from '...';

Meteor.methods({
    posts() {
        const query = postListQuery.clone();
        
        // Warning, if you don't use .clone() and you just .setParams(),
        // those params will remain stored in your query
        query.setParams({
            isApproved: true,
        });
        
        return query.fetch();
    }
})
```

## Validating Params

A query can be smart enough to know what parameters it needs, for this we can use the awesome `check` library from Meteor:
http://docs.meteor.com/api/check.html

```js
import {Match} from 'meteor/check';

export default Posts.createQuery({
  $filter({filters, options, params}) {
    filters.isApproved = params.isApproved;
    if (params.authorId) {
        filters.authorId = params.authorId;
    }
  },
  ...
}, {
    validateParams: {
        isApproved: Boolean,
        authorId: Match.Maybe(String),
    }
});
```

If you want to craft your own validation, it also accepts a function that takes params:

```js
{
    validateParams(params) {
        if (somethingIsWrong) {
            throw new Meteor.Error('invalid-params', 'Explain why');
        }
    }
}
```

Note: params validation is done prior to fetching the query, not when you do `setParams()` or `clone()`

If you want to store some default parameters, you can use the `params` option:
```js
export default Posts.createQuery({...}, {
    params: {
        isApproved: true,
    }
});
```

## Conclusion

This is the end of our introduction. As we can see, we can make queries modular and this already gives us
a big benefit. By abstracting them into their own modules we can keep our methods neat and clean.

## [Continue Reading](linking_collections.md) or [Back to Table of Contents](index.md)
