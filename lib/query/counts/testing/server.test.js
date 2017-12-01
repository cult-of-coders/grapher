import { Meteor } from 'meteor/meteor';
import PostsCollection from './bootstrap/collection.test';
import query from './bootstrap/namedQuery.test';

query.expose();
PostsCollection.remove({});
PostsCollection.insert({ text: 'text 1' });
PostsCollection.insert({ text: 'text 2' });
PostsCollection.insert({ _id: 'removeid', text: 'text 3' });

Meteor.methods({
    addPost(text) {
        return PostsCollection.insert({ text });
    },

    removePost(id) {
        PostsCollection.remove({ _id: id });
    },
});
