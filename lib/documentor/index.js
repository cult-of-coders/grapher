import { linkStorage } from '../links/symbols.js';

export default function extractDocumentation() {
    const collections = Mongo.Collection.getAll();
    let DocumentationObject = {};

    _.each(collections, ({name, instance}) => {
        if (name.substr(0, 7) == 'meteor_') {
            return;
        }

        DocumentationObject[name] = {};
        extractSchema(DocumentationObject[name], instance);
        extractLinks(DocumentationObject[name], instance);
    });

    return DocumentationObject;
}


function extractSchema(storage, collection) {
    storage.schema = {};

    if (collection.simpleSchema && collection.simpleSchema()) {
        storage.schema = collection.simpleSchema()._schema;
        _.each(storage.schema, (value, key) => {
            if (value.type && value.type.name) {
                value.type = value.type.name;
            }
        });
    }
}

function extractLinks(storage, collection) {
    storage.links = {};
    const collectionLinkStorage = collection[linkStorage];

    _.each(collectionLinkStorage, (linker, name) => {
        storage.links[name] = {
            collection: !linker.isResolver() ? linker.getLinkedCollection()._name : null,
            strategy: linker.strategy,
            metadata: linker.linkConfig.metadata,
            isVirtual: linker.isVirtual(),
            inversedBy: linker.linkConfig.inversedBy,
            isResolver: linker.isResolver(),
            resolverFunction: linker.isResolver() ? linker.linkConfig.resolve.toString() : null,
            isOneResult: linker.isOneResult(),
            linkStorageField: linker.linkStorageField
        }
    })
}