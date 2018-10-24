import Users from './collection';

Users.addLinks({
  friends: {
      collection: Users,
      field: 'friendIds',
      type: 'many'
  },
});
