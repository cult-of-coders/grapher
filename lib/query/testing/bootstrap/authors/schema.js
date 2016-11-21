export default new SimpleSchema({
    name: {
        type: String
    },
    profile: {
        type: Object,
        blackbox: true,
        optional: true
    }
});