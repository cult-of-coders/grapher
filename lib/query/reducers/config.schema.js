import { SimpleSchema } from 'meteor/simple-schema';

export default new SimpleSchema({
    body: {
        type: Object,
        blackbox: true
    },
    reducer: {
        type: Function
    }
})