const Demo = new Mongo.Collection('exposure_test');
export default Demo;

const DemoLink = new Mongo.Collection('demo_link');

Demo.addLinks({
    children: {
        collection: DemoLink,
        type: 'many'
    }
});