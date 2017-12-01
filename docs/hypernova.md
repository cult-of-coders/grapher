## Hypernova

This is the crown jewl of Grapher. It has been innovated in the laboratories of Cult of Coders,
and engineered for absolute performance. We had to name this whole process somehow, and we had
to give it a bombastic name. Hypernova is the one that stuck.

To understand what we're talking about let's take this example of a query:

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
2. length(posts) x Fetch categories for each post
3. length(posts) x Fetch author for each post
4. length(posts) x Fetch comments for each post
5. length(posts) * length(comments) * Fetch author for each comment
 
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
- Post comments authors: 10*10

This means `131` database requests.

Ok, you can cache some stuff, maybe some authors collide, but in order to write a performant code,
you would have to write a bunch of non-reusable code.

But this is just a simple query, imagine something deeper nested. For Grapher, it's a breeze.

### Hypernova in Action

How many requests does the Hypernova?
- 1 for Posts
- 1 for all authors inside Posts
- 1 for all categories inside Posts
- 1 for all comments inside Posts
- 1 for all authors inside all comments

The number of database requests is predictable, because it represents the number of collection nodes inside the graph.
(If you use reducers that make use of links, take those into consideration as well)

It does this by aggregating filters at each level, fetching the data, and then it reassembles data to their
propper objects.

Not only it makes 5 requests instead of 131, but it smartly re-uses categories and authors at each collection node,
meaning you will have less bandwidth consumed.

Making it more efficient in terms of bandwidth than SQL or other relational databases. Yes, you read that correct.

Example:
```js
{
    posts: {
        categories: {
            name: 1
        }
    }
}
```

Let's assume we have 100 posts, and the total number of categories is like 4. Hypernova does 2 requests to the database,
and fetches 100 posts, and 4 categories. If you would have used `JOIN` functionality in SQL, you would have received
the categories for each post.

Now you understand why this is a revolution for MongoDB and Meteor.

Keep in mind that Hypernova is only used for static queries. For reactive queries, we still rely on the recursive fetching.

## [Continue Reading](denormalization.md) or [Back to Table of Contents](index.md)




