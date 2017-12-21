# Grapher 1.3

[![Build Status](https://api.travis-ci.org/cult-of-coders/grapher.svg?branch=master)](https://travis-ci.org/cult-of-coders/grapher)

*Grapher* is a Data Fetching Layer on top of Meteor and MongoDB. It is production ready and battle tested.

Main features:
- Innovative way to make MongoDB relational
- Reactive data graphs for high availability
- Incredible performance
- Denormalization ability
- Connection to external data sources
- Usable from anywhere

It marks a stepping stone into evolution of data, enabling developers to write complex and secure code,
while maintaining the code base easy to understand.

### Installation
```
meteor add cultofcoders:grapher
```

### [Documentation](docs/index.md)

This provides a learning curve for Grapher and it explains all the features. If you want to visualize the documentation better, check it out here:

https://cult-of-coders.github.io/grapher/

### [API](docs/api.md)

Grapher cheatsheet, after you've learned it's powers this is the document will be very useful.

#### Live View
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
