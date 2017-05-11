import Demo, {DemoPublication, DemoMethod} from './demo.js';
import Intersect, { CollectionLink as IntersectLink } from './intersect';
import { Exposure } from 'meteor/cultofcoders:grapher';

Demo.expose({
    firewall(filters, options, userId) {
        Exposure.restrictFields(filters, options, ['restrictedField']);
        filters.isPrivate = false;
    },
    maxLimit: 2,
    maxDepth: 2,
    restrictLinks(userId) {
        return ['restrictedLink'];
    },
    method: true,
    publication: true,
});

DemoMethod.expose({
    publication: false,
    method: true,
});

DemoPublication.expose({
    method: false,
    publication: true,
});

Intersect.expose({
    body: {
        value: 1,
        link(userId) {
            if (!userId) {
                return {value: 1};
            }
        }
    },
    method: true,
    publication: true,
});

IntersectLink.expose({
    firewall() {
        throw new Meteor.Error('I do not allow!')
    },
    method: true,
    publication: true,
});
