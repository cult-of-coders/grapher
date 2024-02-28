import { ProductAttributes } from "../../../../query/testing/bootstrap/products/collection";

const productAttributesList = ProductAttributes.createQuery('productAttributesList', {
    unit: 1,
    delivery: 1,
    productId: 1,
    products: {
        title: 1,
        productId: 1,
    },
});

if (Meteor.isServer) {
    productAttributesList.expose({
        firewall() {},
    });
}

export default productAttributesList;
