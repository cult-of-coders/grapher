## Grapher as an API

If you like Grapher, or if `like` is an understatement, you can use it in any other language/medium. 

You can expose it as an `HTTP API`, or via `DDP` (as a meteor method) for example, because 
in React Native you have ways to connect to Meteor with:

https://www.npmjs.com/package/react-native-meteor#meteor-collections 

Basically what Grapher needs to properly execute is the query, and you can make use of the firewalls easily, 
but you need to manually handle authorization yourself.

### Exposing an HTTP API

```js
// This is how you can create a sample endpoint

import {createQuery} from 'meteor/cultofcoders:grapher';
import Picker from 'meteor/meteorhacks:picker';
import {EJSON} from 'meteor/ejson';
import {Meteor} from 'meteor/meteor';
import bodyParser from 'body-parser';

const grapherRoutes = Picker.filter(function () {
    return true;
});

grapherRoutes.middleware(bodyParser.raw({
    'type': 'application/ejson',
}));

grapherRoutes.route('/grapher', function (req, res) {
    const body = req.body.toString();
    const data = EJSON.parse(body);
    
    // lets say this is a named query that looks like
    const {query} = data; // query = {userList: params}
    
    // authorize the user somehow
    // it's up to you to extract an userId
    // or something else that you use for authorization
    
    const actualQuery = createQuery(query);
    
    // if it's not a named query and the collection is not exposed, don't allow it.
    // if you don't put this snippet of code, people will be able to do { users: { services: 1 } } types of queries.
    // this is related to global queries.
    if (actualQuery.isGlobalQuery && !actualQuery.collection.__isExposedForGrapher) {
        throw new Meteor.Error('not-allowed');
    }
    
    try {
        const data = actualQuery.fetch({
            // the userId (User Identification) that hits the firewalls
            // user id can be anything, an API KEY, an Object, you and your firewalls decide
            userId: 'XXX',
            // you can specify other fields, because this is the context of the firewall
            // whatever you define here, it can be accessed with `this`
        });
        
        res.statusCode = 200;
        res.end(EJSON.stringify({
            data,
        }));
    } catch (e) {
        res.statusCode = 500;
        res.end(EJSON.stringify({
            error: e.reason,
        }));
    }
})
```

Now you can do HTTP requests of `Content-Type: application/ejson` to http://meteor-server/grapher and retrieve data,
in EJSON format. If `EJSON` is not available in your language, you can parse it with `JSON` as well.

If you are in the JavaScript world: https://www.npmjs.com/package/ejson 

If you want to use Meteor's Methods as an `HTTP API` to also handle mutations, 
take a look here: https://github.com/cult-of-coders/fusion

And more closely: https://github.com/cult-of-coders/fusion/blob/7ec5cd50c3a471c0bdd65c9fa482124c149dc243/fusion/server/route.js

### Exposing a DDP Method

If you are connected to Meteor by DDP, using any DDP Client:

- React Native: https://www.npmjs.com/package/react-native-meteor
- JS: https://www.npmjs.com/package/ddp-client
- PHP: https://github.com/zyzo/meteor-ddp-php
- Python: https://github.com/hharnisc/python-ddp
- Ruby: https://github.com/tmeasday/ruby-ddp-client

```js
import {createQuery} from 'meteor/cultofcoders:grapher';

Meteor.methods({
    'grapher'(query) {
        const actualQuery = createQuery(query);
        
        if (actualQuery.isGlobalQuery && !actualQuery.collection.__isExposedForGrapher) {
            throw new Meteor.Error('not-allowed');
        }
        
        return actualQuery.fetch({
            userId: this.userId,
        })
    }
})
```

## Conclusion

Nothing stops you from using Grapher outside Meteor!

## [Continue Reading](api.md) or [Back to Table of Contents](index.md)