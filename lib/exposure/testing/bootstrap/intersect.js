const Collection = new Mongo.Collection('exposure_intersect');
export default Collection;

export const CollectionLink = new Mongo.Collection('exposure_intersect_link');

Collection.addLinks({
    link: {
        collection: CollectionLink,
        type: 'one'
    },
    privateLink: {
        collection: CollectionLink,
        type: 'one'
    }
});

CollectionLink.addLinks({
    myself: {
        type: 'one',
        collection: CollectionLink
    }
});