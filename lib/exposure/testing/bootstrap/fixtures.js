import { restrictFields } from 'meteor/cultofcoders:grapher';
import { Exposure } from 'meteor/cultofcoders:grapher';

Exposure.setConfig({
    maxLimit: 5
});

import Demo from './demo.js';

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

Demo.insert({
    isPrivate: false,
    restrictedField: 'PRIVATE'
});

Demo.expose({
    firewall(filters, options, userId) {
        restrictFields(filters, options, ['restrictedField']);

        filters.isPrivate = false;
    },
    maxLimit: 2,
    maxDepth: 1
});