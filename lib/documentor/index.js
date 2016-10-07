import { linkStorage } from '../links/symbols.js';
import NamedQueryStore from '../namedQuery/store';

export default function extract() {
    return {
        namedQueries: extractNamedQueryDocumentation(),
        collections: extractCollectionDocumentation()
    }
};

function extractNamedQueryDocumentation() {
    const namedQueries = NamedQueryStore.getAll();

    let DocumentationObject = {};

    _.each(namedQueries, namedQuery => {
        DocumentationObject[namedQuery.queryName] = {
            body: namedQuery.body,
            collection: namedQuery.collection._name,
            isExposed: namedQuery.isExposed,
            paramsSchema: (namedQuery.exposeConfig.schema)
                ?
                formatSchemaType(
                    _.clone(namedQuery.exposeConfig.schema, true)
                )
                : null
        };
    });

    return DocumentationObject;
}

function extractCollectionDocumentation() {
    const collections = Mongo.Collection.getAll();
    let DocumentationObject = {};

    _.each(collections, ({name, instance}) => {
        if (name.substr(0, 7) == 'meteor_') {
            return;
        }

        DocumentationObject[name] = {};
        DocumentationObject[name]['isExposed'] = !!instance.__isExposedForGrapher;

        extractSchema(DocumentationObject[name], instance);
        extractLinks(DocumentationObject[name], instance);
    });

    return DocumentationObject;
}


function extractSchema(storage, collection) {
    storage.schema = {};

    if (collection.simpleSchema && collection.simpleSchema()) {
        storage.schema = _.clone(collection.simpleSchema()._schema, true);

        formatSchemaType(storage.schema);
    }
}

function formatSchemaType(schema) {
    _.each(schema, (value, key) => {
        if (value.type && value.type.name) {
            value.type = value.type.name;
        }
    });

    return schema;
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