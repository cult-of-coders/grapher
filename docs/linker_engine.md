# Linker Engine

The linker engine is composed of 3 components:
- **Definition of Links** (the `addLinks()` thingie, which we already covered)
- **Linked Data Retrieval** (fetching related linked data)
- **Setting Links** (actually updating the database)

Let's explore how we can play with `Linked Data Retrieval` and `Setting Links`, after we already defined our links
using `addLinks()` method.

Each collection gets extended with a `getLink` function:
```js
const linker = Collection.getLink(collectionItemId, 'linkName');
```

A real life example (assuming you have a `direct` or `inversed` link with groups)
```js
const userGroupLinker = Meteor.users.getLink(userId, 'groups');
```

Linker is polymorphic and it allows you to do almost magical things. It is so flexible that it will
allow you to use it very naturally.

## Linked Data Retrieval

```js
const userGroupLinker = Meteor.users.getLink(userId, 'groups');

// fetching the groups for that user:
const groups = userGroupLinker.find().fetch();
// or for ease of use
const groups = userGroupLinker.fetch();
// or to filter the linked elements
const groups = userGroupLinker.find(filters, options).fetch();
// and again simpler
const groups = userGroupLinker.fetch(filters, options);

// and if you want to get a count()
const groups = userGroupLinker.find(filters, options).count();
```

This works with any kind of links from any side.

## Setting Links

This allows you to very easily link collections to each other, without relying on knowing the fields and how are they stored.
It also allows you to set links from any place `direct` and `inversed`, of any type `one` or `many` and `meta` links as well,
enabling doing this in a natural way:

### One Links

```js
const userPaymentProfileLink = Meteor.users.getLink(userId, 'paymentProfile');

userPaymentProfileLink.set(paymentProfileId);
// but it also works if you have the object directly if it has _id, for ease of use:
userPaymentProfileLink.set(paymentProfile);

// it works from the other side as well
const paymentProfileUserLink = PaymentProfiles.getLink(paymentProfileId, 'user');
paymentProfileUserLink.set(userId); // or a user object that contains `_id`
```


You can also `set()` objects that aren't in the database yet.
Performing a `set()` will automatically execute the update or insert in the database.

```js
const userPaymentProfileLink = Meteor.users.getLink(userId, 'paymentProfile');

userPaymentProfileLink.set({
    last4digits: '1234',
});
```

This will insert into the `PaymentProfiles` collection and link it to user and it works from both `direct` and `inversed` side as well.

To remove a link for a `one` relationship (no arguments required):
```js
// from direct or inversed side
userPaymentProfileLink.unset();
paymentProfileUserLink.unset();
```

### Many Links

Same principles as above apply, with some minor changes, this time we use `add` and `remove`

```js
const userGroupsLink = Meteor.users.getLink(userId, 'groups');
userGroupsLink.add(groupId);
userGroupsLink.add(group); // object containing an _id
userGroupsLink.add({
    name: 1,
}); // will add the group to the database and link it accordingly
```

The methods `add()` and `remove()` also accept arrays
```js
userGroupsLink.add([
    groupId1,
    groupId2
]);

userGroupsLink.remove(groupIds)
```

The same logic applies, you can:
- Single string *OR* Object with _id *OR* Object without _id
- Array of any mixture of the first ^

The `remove()` cannot accept objects without `_id` as it makes no sense to do so.

### Meta Links

Now things get very interesting, because `metadata` allows us to store additional information about the link,
it lets us **describe** the relationship. This works from `direct` and `inversed` side as well, with the 
same principles described as above.

The `add()` and `set()` allow an additional parameter `metadata`:

```js
// assumming our link now have {metadata: true} in their definition

// one
const userPaymentProfileLink = Meteor.users.getLink(userId, 'paymentProfile');

userPaymentProfileLink.set(paymentProfileId, {
    createdAt: new Date()
});

// many
const userGroupsLink = Meteor.users.getLink(userId, 'groups');

userGroupsLink.add(groupId, {
    createdAt: new Date(),
})

// if you add multiple objects, they will receive the same metadata
userGroupsLink.add([groupId1, groupId2], {
    createdAt: new Date(),
})
```

Updating existing metadata:
```js
// one
const userPaymentProfileLink = Meteor.users.getLink(userId, 'paymentProfile');

userPaymentProfileLink.metadata({
    updatedAt: new Date()
});

// many
userGroupsLink.metadata(groupId, {
    createdAt: new Date(),
})
userGroupsLink.metadata([groupId1, groupId2], {
    createdAt: new Date(),
})
```

Updating metadata only works with strings or objects that contain `_id`, and it works from both sides.

## Conclusion

By using this Programatic API to set your links instead of relying on updates, it makes your code much simpler to read,
and makes schema migration easier in the future.

## [Continue Reading](query_options.md) or [Back to Table of Contents](index.md)



