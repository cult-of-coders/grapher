Welcome to Grapher
==================

[![Build Status](https://api.travis-ci.org/cult-of-coders/grapher.svg?branch=master)](https://travis-ci.org/cult-of-coders/grapher)

(Build is not failing, it's just phantomjs acting weird on travis, all tests pass)

Documentation
-------------
[http://grapher.cultofcoders.com](http://grapher.cultofcoders.com/)

Long Term Support
-----------------
Version 1.2 will be supported until 2020.

What ?
------
*Grapher* is a high performance data fetcher and collection relationship manager for Meteor and MongoDB:

1. Makes data MongoDB denormalization easy (storing and linking data in different collections) 
2. You can link your MongoDB data with any type of database, and fetch it via Queries
3. You have the same API for data-fetching whether you want your data to be reactive or not.

Sample
-------------

To give you an idea how this works, you can fetch the data like this:

```
{
    users: {
        profile: 1,
        githubTickets: {},
        posts: {
            title: 1,
            comments: {
                text: 1,
                date: 1,
                author: {
                    profile: 1
                }
            }
        }
    }
}
```

Updates
-------
Check-out the [CHANGELOG](CHANGELOG.md) for latest updates.

Installation
------------
```
meteor add cultofcoders:grapher
```

Useful packages and integrations
--------------------------------

#### Integration with React (cultofcoders:grapher-react)

Provides you with an easy to use "createQueryContainer" function.

- [Atmosphere](https://atmospherejs.com/cultofcoders/grapher-react)
- [GitHub](https://github.com/cult-of-coders/grapher-react/)

#### Live View (cultofcoders:grapher-live)

Provides a playground for grapher and provides documentation of your data

- [Atmosphere](https://atmospherejs.com/cultofcoders/grapher-live) 
- [GitHub](https://github.com/cult-of-coders/grapher-live)

Boiler plate Meteor + React + Grapher
-------------------------------------
https://github.com/cult-of-coders/grapher-boilerplate
