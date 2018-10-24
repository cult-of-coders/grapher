import { createQuery } from 'meteor/cultofcoders:grapher';

const userListScoped = createQuery('userListScoped', {
  users: {
    name: 1,
    friends: {
      name: 1
    },
    subordinates: {
      name: 1,
    }
  }
}, {
  scoped: true
});

if (Meteor.isServer) {
  userListScoped.expose({
    firewall() {
    },
    embody: {
      $filter({filters, params}) {
        filters.name = params.name;
      }
    }
  })
}

export default userListScoped;
