import {Products, ProductAttributes} from './collection';

Products.addLinks({
    // here we are assuming manu relationship
    attributes: {
        collection: ProductAttributes,
        inversedBy: 'products',
    },
    singleAttribute: {
        type: 'one',
        collection: ProductAttributes,
        field: 'singleProductId',
        foreignIdentityField: 'singleProductId',
        unique: true,
    },
});

ProductAttributes.addLinks({
    products: {
        type: 'many',
        collection: Products,
        field: 'productId',
        foreignIdentityField: 'productId',
    },
    singleProduct: {
        collection: Products,
        inversedBy: 'singleAttribute',  
    },
});
