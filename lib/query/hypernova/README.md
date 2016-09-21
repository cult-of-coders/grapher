Hypernova
=========

Is a grapher module that allows us to use aggregate from mongodb to dramatically reduce the number of fetching requests.
It's purpose is to fetch the data at each level for each collection node once for all parents and fill a localCollection with them.

Given this post as example:

```
{
    ownerId: "XXX",
    title: "Title"
}
```

This query will return the 5 sorted elements by title for every ownerId.

```
db.posts.aggregate([
  {
    $match: {
      ownerId: {$in: ['dYhiztHwXfqEQe4mu', 'WNahEeoMAsKMjEGmH']}
    }
  },
  {
    $sort: {
      title: -1
    }
  },
  {
    $group: {
      _id: "$ownerId",
      data: {
        $push: {
          _id: "$_id",
          title: "$title"
        }
      }
    }
  },
  {
    $project: {
      _id: 1,
      data: {
        $slice: ["$data", 5]
      }
    }
  }
]).pretty();
```

```
db.posts.aggregate([
  {
    $match: {
      tagIds: {$in: ['GRuohyRnY7Ak6MPTW', 'qjWvfEJuMsXtWPNbi']}
    }
  },
  {
    $group: {
      _id: "$tagIds",
      data: {
        $push: {
          _id: "$_id",
          title: "$title"
        }
      }
    }
  },
  {
    $project: {
      _id: 1,
      data: {
        $slice: ["$data", 5]
      }
    }
  }
]).pretty();
```