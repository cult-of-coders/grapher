## Hypernova

This is the crown jewl of Grapher. It was named like this because it felt like an explosion of data.

Grapher is very performant. To understand what we're talking about let's take this example of a query

```js
createQuery({
    posts: {
        categories: {
            name: 1,
        },
        author: {
            name: 1,
        },
        comments: {
            $options: {limit: 10},
            author: {
                name: 1,
            }
        }
    }
})
```

### Queries Counting

In a normal scenario, to retrieve this data graph we need to:
1. Fetch the posts
2. posts.length * Fetch categories for each post
3. posts.length * Fetch author for each post
4. posts.length * Fetch comments for each post
5. posts.length * 10 * Fetch author for each comment
 
Assuming we have: 
- 10 posts
- 2 categories per post
- 1 author per post
- 10 comments per post
- 1 author per comment

We would have blasted the database with:
- Posts: 1
- Categories: 10
- Post authors: 10
- Post comments: 10
- Post comments authors: 100

This means 131 database requests. 
Ok, you can cache some stuff, maybe some authors collide, but in order to write a performant code,
you would have to write a bunch of non-reusable code.

But this is just a simple query, imagine something deeper nested. Grapher simply destroys any other
MongoDB "relational" ORM.

### Hypernova to the rescue

How many requests does the Hypernova?
- 1 for Posts
- 1 for all authors inside Posts
- 1 for all categories inside Posts
- 1 for all comments inside Posts
- 1 for all authors inside all comments

The number of database is predictable, because it represents the number of collection nodes inside the graph.

It does this by aggregating filters and then it reassembles data locally.

Not only it makes 5 requests instead of 131, but it smartly re-uses categories and authors at each collection node,
meaning you will have less bandwidth consumed.

Now you understand why this is a revolution for MongoDB.

Keep in mind that Hypernova is only used for static queries. For reactive queries, we still rely on the recursive fetching.



