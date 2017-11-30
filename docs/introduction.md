# Welcome

## Installation
```
meteor add cultofcoders:grapher
```

## The 3 Modules

Grapher is composed of 3 main modules, that work together:

### Link Manager
This module allows you to configure relationships between collections and allows you to create denormalized links and resolver links.

### Query
The query module is used for fetching your data in a friendly manner, such as:
```js
createQuery({
    users: {
        firstName: 1
    }
})
```

It abstracts your query into a graph composed of Collection Nodes, Field Nodes and Resolver Nodes,
it uses the **Link Manager** to construct this graph and if the fetching is done server-side (non-reactive queries),
it uses the **Hypernova Module** the crown jewl of Grapher, which heavily minimizes requests to database.

### Exposure

The exposure represents the layer between your queries and the client, allowing you to securely expose your queries,
only to users that have access. 


### Your first query

You can use Grapher, without defining any links, for example, let's say you have a method which returns a list of posts.

```js
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

Transforming this into a Grapher query would simply look like this:

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


If, for example, you want to filter or sort your query, we have some special query variables to do so:

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

As you may have noticed, the $filters and $options are the ones you pass to `find()`.

The nature of a Query is to be re-usable. For this we introduce a special type of field called `$filter`.
And we allow the query to receive parameters before it executes:

```js
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

The `$filter()` function receives a single object that contains 3 objects: `filters`, `options`, `params`.
The `filters` and `options` are initially what you provided in `$filters` and `$options` query, they will be empty
if they haven't been specified.

The job of `$filter()` is to extend/modify `filters` and `options`, based on params.

Lets see how we can use that query:

```js
// assuming you exported it from '...'
import postListQuery from '...';

Meteor.methods({
    posts() {
        return postListQuery.clone({
            isApproved: true
        }).fetch()
    }
})
```

Whenever we want to use a modular query, we have to `clone()` it so it creates a new standalone instance,
that does not affect the exported one. The `clone()` accepts `params` as argument.
Those `params` will be passed to the `$filter` function.

You could also use `setParams()` to configure parameters:

```js
import postListQuery from '...';

Meteor.methods({
    posts() {
        const query = postListQuery.clone();
        
        query.setParams({
            isApproved: true,
        });
        
        return query.fetch();
    }
})
```

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

But you can craft your own validation:
```js
{
    validateParams(params) {
        if (somethingIsWrong) {
            throw new Meteor.Error('invalid-params', 'Explain why');
        }
    }
}
```

Note: params validation is done prior to fetching the query.

And if you want to set some default parameters:
```js
export default Posts.createQuery({...}, {
    params: {
        isApproved: true,
    }
});
```

## [Conclusion](table_of_contents.md)

This is the end of our introduction. As we can see, we can make queries modular and this already gives us
a big benefit. By abstracting them into their own modules we can keep our methods neat and clean,
and we haven't even arrived to the good parts.


 
 

 
 




