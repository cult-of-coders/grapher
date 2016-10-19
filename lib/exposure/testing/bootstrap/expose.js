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
    }
});

DemoMethod.expose({
    publication: false
});

DemoPublication.expose({
    method: false
});

Intersect.expose({
    body: {
        value: 1,
        link(userId) {
            if (!userId) {
                return {value: 1};
            }
        }
    }
});

IntersectLink.expose({
    firewall() {
        throw new Meteor.Error('I do not allow!')
    }
});