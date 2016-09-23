
Reference API
=============

Collection Links
-------------------

#### Adding Links
```
PoliceMen.addLinks({
    donuts: {
        type: 'one'|'many',
        collection: RelatedCollection,
        field: 'relatedId' // optional, it generates you custom one
        metadata: {} // use it for meta relationships
        index: false // if set to true will create indexes for the links
        autoremove: false // if set to true it will remove the link
    }
});

Donuts.addLinks({
    policemen: {
        collection: PoliceMen,
        inversedBy: 'donuts'
    }
});
```

#### Fetching Links
```
const link = Collection.getLink(docId, 'linkName');

link.find([filters], [options]); // returns Mongo.Cursor
link.fetch([filters], [options]); // returns object or array of objects depending on relationship type.
link.find([filters], [options]).fetch(); // always returns array of objects
```

#### Managing Links (One Relationship)
```
// for one relationships
link.set(relatedId);
link.unset();
```


#### Managing Links (One Meta Relationship)
```
link.set(relatedId, {isSomething: true});
link.metadata(); // returns the metadata: // {_id: relatedId, isSomething: true}
link.metadata({isSomething: false}); // sets the metadata by extending the current metadata.
link.metadata({otherStuff: true}); // will update the metadata
link.metadata(); // returns the metadata: {_id: relatedId, someConditions: true, otherStuff: true}
link.unset(); // removes the link along with metadata.
```

#### Managing Links (Many Relationship)
```
link.add(relatedId) // accepts as arguments: [relatedId1, relatedId2], relatedObject, [relatedObject1, relatedObject2]
link.add(objectWithoutIdProperty) // it will create the object and save it in the db and also link it
link.add([objectWithoutIdProperty, _id]) // it will create the object objectWithoutIdProperty, and just link it with _id string.

link.remove(relatedId) // accepts as arguments: [relatedId1, relatedId2], relatedObject, [relatedObject1, relatedObject2]
```

#### Managing Links (Many Meta Relationship)
```
link.add(relatedId, {someConditions: true}); // it also works with [relatedId1, relatedId2, relatedObj1, relatedObj2]
link.metadata(relatedId) // {_id: relatedId, someConditions: true}
link.metadata() // [{_id: relatedId, someConditions: true}, {_id: relatedI2, someThingElse: false}, ...]
link.metadata(relatedId, {otherStuff: true}); // will update the metadata
link.metadata(relatedId) // {_id: relatedId, someConditions: true, otherStuff: true}
link.remove(relatedId); // will remove the link with the relatedId along with the metadata
```

Exposing Collections
--------------------
```
Collection.expose((filters, options, userId) => {
    if (!isAdmin(userId)) {
        filters.userId = userId;
    }
    // here you can do stuff like restrict options.fields or override certain filters
});
```


Query
-----

If you create your collection like:
```
const Posts = new Mongo.Collection('posts')
```

Then "posts" is the name of your collection.

You have two ways of creating the query:
```
import { createQuery } from 'meteor/cultofcoders:grapher';

const query = createQuery({
    posts: {
        title: 1
    }
}, [parameters])
```

OR from the collection directly:

```
const query = Posts.createQuery({
    $filter({filters, options, params}) {
        filters.isApproved = true;
        options.limit = params.limit;
    },
    $options: {
        sort: {createdAt: -1}
    },
    createdAt: 1,
    title: 1,
    comments: {
        $filter({filters, options, params}) {
            if (params.categories) {
                filters.categoryId = {$in: categories}
            }
        },
        author: {
           $filters: {
                isApproved: true // if the author is not approved, comment.author will be empty
           },
        }
    }
}, {
    categories: ['id1', 'id2'],
    limit: 100;
});
```

#### Query - Playing with Dynamic Queries

```
query.setParams({limit: 200});
```

#### Query - Fetching Data

```
// server side
const data = query.fetch();
const data = query.fetch({
    userId: 'Id of the user you want to impersonate, for exposure, null can be used'
})

// client side
query.fetch((error, response) => {...});

// reactive
query.subscribe();
query.fetch(); // will fetch the data from client-side collections. and store the resulted links in the documents.
query.unsubscribe();
```
