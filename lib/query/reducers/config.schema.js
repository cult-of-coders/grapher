import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
    body: {
        type: Object,
        blackbox: true
    },
    reducer: {
        type: Function
    }
})