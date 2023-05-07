import createGraph from '../query/lib/createGraph.js';
import {Match} from 'meteor/check';

export const ExposureDefaults = {
    blocking: false,
    method: true,
    publication: true,
};

export const ExposureSchema = {
    firewall: Match.Maybe(
        Match.OneOf(Function, [Function])
    ),
    maxLimit: Match.Maybe(Match.Integer),
    maxDepth: Match.Maybe(Match.Integer),
    publication: Match.Maybe(Boolean),
    method: Match.Maybe(Boolean),
    blocking: Match.Maybe(Boolean),
    body: Match.Maybe(Match.OneOf(Object, Function)),
    restrictedFields: Match.Maybe([String]),
    restrictLinks: Match.Maybe(
        Match.OneOf(Function, [String])
    ),
};

export function validateBody(collection, body) {
    try {
        createGraph(collection, body);
    } catch (e) {
        throw new Meteor.Error('invalid-body', 'We could not build a valid graph when trying to create your exposure: ' + e.toString())
    }
}
