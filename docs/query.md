Query
=====

Creating a query for a collection client-side, must be exposed server side. Otherwise it will not work.

Queries are a way to specify which data you want from the server using links as the backbone for creating the data graph.
Queries can be reactive (using pub/sub) or static (using method call)

Let's configure some links, and then see how we can query them into the database.

Assuming we have these collections: Authors, Comments, Posts, Groups, Category:

- Author has many posts.
- Author can belong in many groups.
- Posts has many comments.
- Posts has one category.
- Comments has a single author.

Notes to keep in mind:
- By default type is one, but you should specify it for clarity.
- Field is not necessary because it will autogenerate a field like "collection_relatedCollection_linkName", but it's cleaner if you specify it.

Don't panic! If something stops making sense. Review the [Collection Links](links.md) documentation again.

```
Authors.addLinks({
    groups: {
        collection: Groups,
        field: 'groupIds',
        type: 'many'
    },
    posts: {
        collection: Posts,
        inversedBy: 'author'
    },
    likesOnFacebook: {
        // in this case resolver will receive: object, filters, options, userId
        // since resolver is run server side, the author will be the full object with all the fields.
        resolver(author) {
            // do a sync call to retrieve the likes on facebook using author object.
            return count;
        }
    }
});

Posts.addLinks({
    author: {
        collection: Authors,
        type: 'one',
        field: 'authorId'
    },
    // it can have a lot of comments, so it's safer if we store the link in Comments collection
    comments: { 
        collection: Comments,
        inversedBy: 'post'
    },
    category: {
        collection: Categories,
        type: 'many',
        field: 'categoryIds'
    }
});

Comments.addLinks({
    author: {
        collection: Authors,
        field: 'authorId'
    },
    post: {
        collection: Posts,
        field: 'postId'
    }
});

Category.addLinks({
    author: {
        collection: Authors,
        inversedBy: 'category',
    }
});

Groups.addLinks({
    authors: {
        collection: Authors,
        inversedBy: 'groups'
    }
});
```

Perfect. Now that we defined our relationships we can query our database.
Assuming we exposed "Posts" server-side, we can fetch the query client-side.

Notes:

- Use {} to specify a link, and 1 for a field.
- "_id" will always be fetched
- You must always specify the fields you need, otherwise it will only fetch _id

```
const query = Posts.createQuery({
    title: 1,
    // if there are no custom fields specified, it will retrieve all fields.
    author: {
        // if you have a nested object, (no link named profile) it will not try to fetch the link, but rather give you only the fields you need.
        profile: {
            firstname: 1
            lastname: 1
        },
        likesOnFacebook: 1
    } 
    comments: {
        text: 1,
        // if you don't specify any local fields for the author, only "_id" field will be fetched
        // this will enforce the use of query and retrieve only the data you need.
        author: {
            groups: {
                name: 1
            }
        }
    }
});
```

Now that we have created our query, we have two options of fetching the data.

1. Reactively (via subscribe)
-----------------------------

```
const subsHandle = query.subscribe();
const data = query.fetch();
```

Important! If you previously subscribed, fetching will be done client side using client-side collections,
if you did not previously subscribe, you need to provide a callback because data will be fetched via a method call.

If you don't want to use .fetch() you can also use the collections as you previously used to:
```
Posts.find().fetch()
Comments.find({postId: 'XXXXXX'}).fetch()
```


2. Statically (via method call)
-------------------------------

```
query.fetch((error, response) => {
    // if no error occured, the response will look something like this
    [
        {
            _id: 'XXXXXXXXXXXXXXX',
            title: 'Hello World!',
            author: {
                profile: {
                    firstname: 'John',
                    lastname: 'Smith'
                }
                likesOnFacebook: 200
            },
            comments: [
                {
                    text: 'Nice Post',
                    author: {
                        _id: 'XXXXXXXXXXXXX'
                    },
                    groups: [
                        {
                            _id: 'XXXXXXXXXXX',
                            name: 'Group 1'
                        }
                    ]
                }
            ]
        },
        ...
    ]
});
```

Filtering queries
=================

```
const query = Posts.createQuery({
    $filters: {isApproved: true} // this will find only posts that have isApproved: true
    $options: {
        limit: 100
    }
    title: 1
    comments: {
        $filters: { // this will only search the comments that have isNotSpam: true
            isNotSpam: true
        }
    }
});
```

Dynamic Filtering
=================
You can pass params to your query, they will be available in every $filter() function.
Using $filter() gives you enough control to filters and options. So $filters and $options may be omitted.

```
const query = Posts.createQuery({
    $filter({filters, options, params}) {
        filters.isApproved = params.isApproved
    }
    title: 1
    comments: {
        $filter({filters, options, params}) {
            if (params.allowSpamComments) {
                filters.isNotSpam = undefined; // $filter() overrides $filters and $options
            }
        }
        $filters: { // this will only search the comments that have isNotSpam: true
            isNotSpam: true
        }
    }
}, {
    isApproved: true,
    allowSpamComments: true
});

```

Control parameters however you wish:
```
query.setParams({
    allowSpamComments: false
});
```

If you are using this query reactively, the query will re-subscribe.

Using it with React And react-meteor-data package:

```
import query from './listPostsQuery.js';

export default createContainer(() => {
    const handle = query.subscribe();
    const posts = query.fetch();
    
    return {
        isReady: handle.isReady(),
        posts: posts
    }
}, PostList);
```

Security and Performance
========================

By default the options "disableOplog", "pollingIntervalMs", "pollingThrottleMs" are not available on the client.
You can control them in the firewall of your exposure.
