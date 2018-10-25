import Users from './collection';

Users.addLinks({
  friends: {
      collection: Users,
      field: 'friendIds',
      type: 'many'
  },
  subordinates: {
    collection: Users,
    field: 'subordinateIds',
    type: 'many'
  },
  friendsCached: {
    collection: Users,
    field: 'friendIds',
    type: 'many',
    denormalize: {
      field: 'friendsCache',
      body: {
        name: 1
      }
    }
},
});
