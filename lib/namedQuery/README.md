A secure query is a query in which the form of it is locked on the server.
Frozen queries are regarded as trusted code, the exposure from other collections will not affect them.
Only the firewall.

The reason behind this concept:
- You may have an Order for a Customer and to that order is an employee assigned
- You want to expose all employees to admin via user exposure
- Now, because exposures are linked you may need to add extra logic to user exposure, and it will eventually turn into a mess
- It gets hard to validate/invalidate fields links.

This is the reason why you should construct your secure query and offer control over it via params. That can be used and manipulated in $filter function.


```

const query = createNamedQuery('testList', {
    tests: {
        $filter({
            filters, 
            options, 
            params
        }) {
                
        },
        title: 1,
        endcustomer: {
            profile: 1
        }
    }
})
```


```
// In the same file or in a server-side file only:
query.expose({
    firewall(userId, params) {
         // throw exception if not allowed 
    },
    body: { // merges deeply with your current body, so you can filter without showing the client how you do it to avoid exposing precious data
        tests: {
            $filter({filters, options, params})
        }
    }
})
```

```
// You must have your collections and queries imported already.
// Client side
createQuery({
    testListQuery: {
        endcustomer: Meteor.userId()
    }
})

```