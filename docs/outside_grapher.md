## Grapher as an API

If you like Grapher, you can use it in any other language/medium. 

You can expose it as an HTTP API, or a DDP API (as a Meteor.method()) for example,
because in ReactNative you have ways to connect to Meteor with:
https://www.npmjs.com/package/react-native-meteor#meteor-collections 

Basically what Grapher needs to properly execute is the query,
and if you have firewalls, you need to manually handle authorization yourself.

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
    // {getUserList: params}
    const {query} = data;
    
    // authorize the user somehow
    // it's up to you to extract an userId
    // or something else that you use for authorization
    
    const actualQuery = createQuery(query);
    
    // if it's not a named query and the collection is not exposed, don't allow it.
    if (actualQuery.isGlobalQuery && !actualQuery.collection.__isExposedForGrapher) {
        throw new Meteor.Error('not-allowed');
    }
    
    try {
        const data = actualQuery.fetch({
            // the userId (User Identification) that hits the firewalls
            // user id can be anything, an API key maybe, not only a 'string'
            // it's up to you and your firewalls to decide
            userId: 'XXX'
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

Now you can do HTTP requests of `Content-Type: application/ejson` to http://meteor-server/grapher and retrieve data.

If you want to use Meteor's Methods as an HTTP API to also handle method calls, take a look here:
- https://github.com/cult-of-coders/fusion

And more closely: https://github.com/cult-of-coders/fusion/blob/7ec5cd50c3a471c0bdd65c9fa482124c149dc243/fusion/server/route.js

### Exposing a DDP Method
 
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
