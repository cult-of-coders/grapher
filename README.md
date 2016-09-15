Welcome to Grapher
==================

[![Build Status](https://api.travis-ci.org/cult-of-coders/grapher.svg)](https://api.travis-ci.org/cult-of-coders/grapher)

General
-------

*Grapher* is a Meteor package that will enhance the way you are used to fetch data from your collections.

Installation
------------
```
meteor add cultofcoders:grapher
```

Documentation
-------------

Please read the documentation:

- [Collection Links](docs/links.md)
- [Exposing Collections](docs/exposure.md)
- [Query](docs/query.md)


Reference API
=============

Collection Links
-------------------

```
Collection.addLinks({
    linkName: {
        type: 'one'|'many',
        collection: RelatedCollection,
        field: 'relatedId' // optional, it generates you custom one
        metadata: {} // for meta relationships
    }
});

RelatedCollection.addLinks({
    anotherLinkName: {
        collection: MainCollection,
        inversedBy: 'linkName'
    }
});
```


```
const link = Collection.getLink(docId, 'linkName');

link.find([filters], [options]); // returns Mongo.Cursor
link.fetch([filters], [options]); // returns object or array of objects depending on relationship type.
link.find([filters], [options]).fetch(); // always returns array of objects

// for one relationships
link.set(relatedId);
link.unset();

// for many relationships
link.add(relatedId) // accepts as arguments: [relatedId1, relatedId2], relatedObject, [relatedObject1, relatedObject2]
link.remove(relatedId) // accepts as arguments: [relatedId1, relatedId2], relatedObject, [relatedObject1, relatedObject2]

// for meta relationships
// one meta
link.set(relatedId, {someConditions: true});
link.metadata() // {_id: relatedId, someConditions: true}
link.metadata({otherStuff: true}); // will update the metadata
link.metadata() // {_id: relatedId, someConditions: true, otherStuff: true}
link.unset();

// many meta
link.add(relatedId, {someConditions: true});
link.metadata(relatedId) // {_id: relatedId, someConditions: true}
link.metadata(relatedId, {otherStuff: true}); // will update the metadata
link.metadata(relatedId) // {_id: relatedId, someConditions: true, otherStuff: true}
link.remove(relatedId);
```


Exposing Collections
--------------------
```
Collection.expose((filters, options, userId) => {
    if (!isAdmin(userId)) {
        filters.userId = userId;
    }
});
```

Query
-----
```
const query = Collection.createQuery({
    $filter({filters, options, params}) {
        filters.isApproved = true;
        options.limit = params.limit;
    },
    $options: {
        sort: {createdAt: -1}
    },
    createdAt: 1,
    field1: 1,
    field2: 1
    linkName: {
        $filter({filters, options, params}) {
            if (params.param1) {
                filters.param1 = {$in: ['1', '2']}
            }
        },
        sublink: {
           $filters: {
                someField: true
           }
        }
    }
}, {
    param1: true,
    limit: 100;
});

query.setParams({limit: 200});

// client side
query.fetch((error, response) => {...});

// reactive
query.subscribe();
query.fetch((error, response) => {...});

// server side
const data = query.fetch();
```
