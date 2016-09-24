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
    }
})