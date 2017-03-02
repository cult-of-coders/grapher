export default new SimpleSchema({
    firewall: {
        type: Function,
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

    embody: {
        type: Object,
        blackbox: true,
        optional: true
    },

    schema: {
        type: Object,
        blackbox: true,
        optional: true
    }
})