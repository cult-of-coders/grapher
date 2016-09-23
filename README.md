Welcome to Grapher
==================

[![Build Status](https://api.travis-ci.org/cult-of-coders/grapher.svg)](https://travis-ci.org/cult-of-coders/grapher)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/hyperium/hyper/master/LICENSE)

What ?
------
*Grapher* is a high performance data grapher:

1. Makes data MongoDB denormalization easy (storing and linking data in different collections) 
2. You can link your MongoDB data with any type of database, and fetch it via Queries
3. You have the same API for data-fetching whether you want your data to be reactive or not.


How does this compare to [ApolloStack](http://www.apollostack.com/) ?
- You can plug it in your Meteor app directly. It will just work.
- It is built for performance and high data load.
- Apollo tries to satisfy everybody, we are limited to Meteor only.

Updates
-------
Check-out the [CHANGELOG](CHANGELOG.md) for latest updates.

Installation
------------
```
meteor add cultofcoders:grapher
```


Documentation
-------------

Please read the documentation:

- How to link collections ? [Collection Links](docs/links.md)
- How to securely expose data ? [Exposing Collections](docs/exposure.md)
- How to search for the data ? [Query](docs/query.md)

API
---
[Quick Reference API](docs/api.md)


Useful packages and integrations
--------------------------------

#### Integration with React (cultofcoders:grapher-react)

- [Atmosphere](https://atmospherejs.com/cultofcoders/grapher-react)
- [GitHub](https://github.com/cult-of-coders/grapher-react/)

#### Live View (cultofcoders:grapher-live)

- [Atmosphere](https://atmospherejs.com/cultofcoders/grapher-live) 
- [GitHub](https://github.com/cult-of-coders/grapher-live)


Boiler plate Meteor + React + Grapher
-------------------------------------
https://github.com/cult-of-coders/grapher-boilerplate
