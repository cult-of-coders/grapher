import {Match} from 'meteor/check';
import {Mongo} from 'meteor/mongo';

export const DenormalizeSchema = {
    field: String,
    body: Object,
    bypassSchema: Match.Maybe(Boolean)
};

export const LinkConfigDefaults = {
    type: 'one',
};

export const LinkConfigSchema = {
    type: Match.Maybe(Match.OneOf('one', 'many', '1', '*')),
    collection: Match.Maybe(
        Match.Where(collection => {
            // We do like this so it works with other types of collections 
            // like FS.Collection
            return _.isObject(collection) && (
                collection instanceof Mongo.Collection
                || 
                !!collection._collection
            );
        })
    ),
    field: Match.Maybe(String),
    metadata: Match.Maybe(Boolean),
    inversedBy: Match.Maybe(String),
    index: Match.Maybe(Boolean),
    unique: Match.Maybe(Boolean),
    autoremove: Match.Maybe(Boolean),
    denormalize: Match.Maybe(Match.ObjectIncluding(DenormalizeSchema)),
};