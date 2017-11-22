Welcome to Grapher
==================

[![Build Status](https://api.travis-ci.org/cult-of-coders/grapher.svg?branch=master)](https://travis-ci.org/cult-of-coders/grapher) [![Backers on Open Collective](https://opencollective.com/grapher/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/grapher/sponsors/badge.svg)](#sponsors)

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
4. It is compatible with simpl-schema and the older version of it.

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

## Contributors

This project exists thanks to all the people who contribute. [[Contribute]](CONTRIBUTING.md).
<a href="graphs/contributors"><img src="https://opencollective.com/grapher/contributors.svg?width=890" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/grapher#backer)]

<a href="https://opencollective.com/grapher#backers" target="_blank"><img src="https://opencollective.com/grapher/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/grapher#sponsor)]

<a href="https://opencollective.com/grapher/sponsor/0/website" target="_blank"><img src="https://opencollective.com/grapher/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/grapher/sponsor/1/website" target="_blank"><img src="https://opencollective.com/grapher/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/grapher/sponsor/2/website" target="_blank"><img src="https://opencollective.com/grapher/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/grapher/sponsor/3/website" target="_blank"><img src="https://opencollective.com/grapher/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/grapher/sponsor/4/website" target="_blank"><img src="https://opencollective.com/grapher/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/grapher/sponsor/5/website" target="_blank"><img src="https://opencollective.com/grapher/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/grapher/sponsor/6/website" target="_blank"><img src="https://opencollective.com/grapher/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/grapher/sponsor/7/website" target="_blank"><img src="https://opencollective.com/grapher/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/grapher/sponsor/8/website" target="_blank"><img src="https://opencollective.com/grapher/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/grapher/sponsor/9/website" target="_blank"><img src="https://opencollective.com/grapher/sponsor/9/avatar.svg"></a>


