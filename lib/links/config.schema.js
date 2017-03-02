import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
    type: {
        type: String,
        optional: true,
        defaultValue: 'one'
    },
    collection: {
        type: Object,
        blackbox: true,
        optional: true
    },
    field: {
        type: String,
        optional: true
    },
    metadata: {
        type: Object,
        blackbox: true,
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

