const Demo = new Mongo.Collection('exposure_test');
export default Demo;

const DemoLink = new Mongo.Collection('demo_link');
export const DemoRestrictedLink = new Mongo.Collection('DemoRestrictedLink');

Demo.addLinks({
    children: {
        collection: DemoLink,
        type: 'many'
    },
    restrictedLink: {
        collection: DemoRestrictedLink,
        type: 'one'
    }
});

DemoLink.addLinks({
    myself: {
        type: 'one',
        collection: DemoLink
    }
});

export const DemoPublication = new Mongo.Collection('DemoPublication');
export const DemoMethod = new Mongo.Collection('DemoPublicationMethod');