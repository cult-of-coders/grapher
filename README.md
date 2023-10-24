## Introducing BlueLibs

- [GitHub BlueLibs Monorepo](https://github.com/bluelibs/bluelibs)
- Following the same bold vision of Meteor, but with a modern twist. www.bluelibs.com
- Read more about our approach coming from Meteor: https://www.bluelibs.com/blog/2021/11/26/the-meteor-of-2022
- We've implemented [Grapher aka Nova](https://www.bluelibs.com/products/nova) as a standalone npm package compatible to native MongoDB drivers (including Meteor), it is not as feature-rich (no meta links, no pubsub functionality) but is more advanced.

# Grapher 1.5

_Grapher_ is a Data Fetching Layer on top of Meteor and MongoDB. It is production ready and battle tested. Brought to you by [Cult of Coders](https://www.cultofcoders.com) — Web & Mobile Development Company. 

Main features:

*   Innovative way to make MongoDB relational
*   Blends in with Apollo GraphQL making it highly performant
*   Reactive data graphs for high availability
*   Incredible performance
*   Denormalization ability
*   Connection to external data sources
*   Usable from anywhere

It marks a stepping stone into evolution of data, enabling developers to write complex and secure code,
while maintaining the code base easy to understand.

[Read more about the GraphQL Bridge](docs/graphql.md)

## Installation

```
meteor add cultofcoders:grapher
```

## [Documentation](docs/index.md)

This provides a learning curve for Grapher and it explains all the features. If you want to visualize the documentation better, check it out here:

https://cult-of-coders.github.io/grapher/

## [API](docs/api.md)

Grapher cheatsheet, after you've learned it's powers this is the document will be very useful.

## Useful packages

*   Live View: https://github.com/cult-of-coders/grapher-live
*   Graphical Grapher: https://github.com/Herteby/graphical-grapher
*   React HoC: https://github.com/cult-of-coders/grapher-react
*   VueJS: https://github.com/Herteby/grapher-vue

### Events for Meteor (+ Grapher, Redis Oplog and GraphQL/Apollo)

*   Meteor Night 2018: [Arguments for Meteor](https://drive.google.com/file/d/1Tx9vO-XezO3DI2uAYalXPvhJ-Avqc4-q/view) - Theodor Diaconu, CEO of Cult of Coders: “Redis Oplog, Grapher, and Apollo Live.

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

### Quick Illustration

Query:

```js
createQuery({
    posts: {
        title: 1,
        author: {
            fullName: 1,
        },
        comments: {
            text: 1,
            createdAt: 1,
            author: {
                fullName: 1,
            },
        },
        categories: {
            name: 1,
        },
    },
}).fetch();
```

Result:

```
[
    {
        _id: 'postId',
        title: 'Introducing Grapher',
        author: {
            _id: 'authorId',
            fullName: 'John Smith
        },
        comments: [
            {
                _id: 'commentId',
                text: 'Nice article!,
                createdAt: Date,
                author: {
                    fullName: 1
                }
            }
        ],
        categories: [ {_id: 'categoryId', name: 'JavaScript'} ]
    }
]
```

### Testing

You can create test directory and configure dependencies like this (working directory is the root of this repo):
```
# create meteor app for testing
meteor create --release 1.8.1-rc.1 --bare test
cd test
meteor npm i --save selenium-webdriver@3.6.0 chromedriver@2.36.0 simpl-schema chai

# Running tests (always from test directory)
METEOR_PACKAGE_DIRS="../" TEST_BROWSER_DRIVER=chrome meteor test-packages --once --driver-package meteortesting:mocha ../
```

If you use `TEST_BROWSER_DRIVER=chrome` you have to have chrome installed in the test environment. Otherwise, you can just run tests in your browsers.

With `--port=X` you can run tests on port X.

Omit `--once` and mocha will run in watch mode.
