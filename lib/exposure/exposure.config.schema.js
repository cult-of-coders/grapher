import SimpleSchema from 'simpl-schema';
import createGraph from '../query/lib/createGraph.js';

let Schema = new SimpleSchema({
    firewall: {
        type: Object,
        optional: true
    },

    maxLimit: {
        type: Number,
        optional: true,
        min: 1
    },

    maxDepth: {
        type: Number,
        optional: true,
        min: 1
    },

    restrictedFields: {
        type: Array,
        optional: true
    },

    'restrictedFields.$': {
        type: String,
    },

    restrictLinks: {
        type: SimpleSchema.oneOf(Object, Array), // Can be function that accepts userId and returns array or array
        optional: true
    },

    publication: {
        type: Boolean,
        defaultValue: true
    },

    method: {
        type: Boolean,
        defaultValue: true
    },

    body: {
        type: SimpleSchema.oneOf(Object, Array),
        blackbox: true,
        optional: true
    },

    blocking: {
        type: Boolean,
        defaultValue: false
    }
});

export default Schema;

_.extend(Schema, {
    validateBody(collection, body) {
        try {
            createGraph(collection, body);
        } catch (e) {
            throw new Meteor.Error('invalid-body', 'We could not build a valid graph when trying to create your exposure: ' + e.toString())
        }
    }
})