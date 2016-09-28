import { Exposure } from 'meteor/cultofcoders:grapher';

Exposure.setConfig({
    maxLimit: 5
});

import Demo, {DemoPublication, DemoMethod, DemoRestrictedLink} from './demo.js';

Demo.remove({});

Demo.insert({
    isPrivate: true,
    restrictedField: 'PRIVATE'
});

Demo.insert({
    isPrivate: false,
    restrictedField: 'PRIVATE'
});

Demo.insert({
    isPrivate: false,
    restrictedField: 'PRIVATE'
});

const restrictedDemoId = Demo.insert({
    isPrivate: false,
    restrictedField: 'PRIVATE'
});

Demo.getLink(restrictedDemoId, 'restrictedLink').set({
    test: true
});

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