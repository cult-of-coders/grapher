import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export default new SimpleSchema({
    firewall: {
        type: Function,
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
        type: [String],
        optional: true
    },

    restrictLinks: {
        type: null, // Can be function that accepts userId and returns array or array
        optional: true
    },

    publication: {
        type: Boolean,
        defaultValue: true
    },

    method: {
        type: Boolean,
        defaultValue: true
    }
})