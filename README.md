# Grapher 1.3

[![Build Status](https://api.travis-ci.org/cult-of-coders/grapher.svg?branch=master)](https://travis-ci.org/cult-of-coders/grapher)

*Grapher* is a data retrieval layer inside Meteor and MongoDB. It's used in many production apps since 2016.

Main features:
- Innovative way to make MongoDB relational
- Reactive data graphs for high availability
- Incredible performance
- Denormalization Modules
- Connection to external data sources
- Usable from anywhere

It marks a stepping stone into evolution of data, enabling developers to write complex and secure code,
while maintaining the code base easy to understand.

### [Documentation](docs/table_of_contents.md)

### [API](docs/api.md)

### Installation
```
meteor add cultofcoders:grapher
```

### Useful packages and integrations

#### Live View (cultofcoders:grapher-live)

Provides a playground for Grapher and provides documentation of your data
https://github.com/cult-of-coders/grapher-live

#### React
https://github.com/cult-of-coders/grapher-react 

#### Vue JS
https://github.com/Herteby/grapher-vue


### Premium Support

If you are looking to integrate Grapher in your apps and want online or on-site consulting and training, 
shoot us an e-mail contact@cultofcoders.com, we will be more than happy to aid you.


### Quick Illustration

Query:
```js
createQuery({
    posts: {
        title: 1,
        author: {
            fullName: 1
        },
        comments: {
            text: 1,
            createdAt: 1,
            author: {
                fullName: 1
            }
        },
        categories: {
            name: 1
        }
    }
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
