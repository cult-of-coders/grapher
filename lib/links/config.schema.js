import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
    type: {
        type: String,
        optional: true,
        defaultValue: 'one'
    },
    collection: {
        // Don't think we need String here b/c we resolve ref in constructor
        // see https://github.com/aldeed/node-simple-schema/issues/39
        type: Object,
        blackbox: true,
        optional: true
    },
    field: {
        type: String,
        optional: true
    },
    metadata: {
        // see https://github.com/aldeed/node-simple-schema/issues/39
        type: Object,
        blackbox: true,
        optional: true
    },
    metadataIdField: {
        type: String,
        optional: true
    },
    inversedBy: {
        type: String,
        optional: true
    },
    resolve: {
        type: Function,
        optional: true
    },
    index: {
        type: Boolean,
        defaultValue: false,
        optional: true
    },
    autoremove: {
        type: Boolean,
        defaultValue: false,
        optional: true
    },
    unique: {
        type: Boolean,
        defaultValue: false,
        optional: true
    }
});
