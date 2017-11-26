import {Match} from 'meteor/check';
import {Mongo} from 'meteor/mongo';

export const CacheSchema = {
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
        Match.Where(collection => collection instanceof Mongo.Collection)
    ),
    field: Match.Maybe(String),
    metadata: Match.Maybe(Boolean),
    inversedBy: Match.Maybe(String),
    resolve: Match.Maybe(Function),
    index: Match.Maybe(Boolean),
    unique: Match.Maybe(Boolean),
    autoremove: Match.Maybe(Boolean),
    cache: Match.Maybe(Match.ObjectIncluding(CacheSchema)),
};