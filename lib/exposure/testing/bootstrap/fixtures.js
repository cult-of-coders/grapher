import { Exposure } from 'meteor/cultofcoders:grapher';

Exposure.setConfig({
    maxLimit: 5
});

import Demo, {DemoPublication, DemoMethod, DemoRestrictedLink} from './demo.js';
import Intersect, { CollectionLink as IntersectLink } from './intersect';

Demo.remove({});
DemoRestrictedLink.remove({});

Intersect.remove({});
IntersectLink.remove({});

Demo.insert({isPrivate: true, restrictedField: 'PRIVATE'});
Demo.insert({isPrivate: false, restrictedField: 'PRIVATE'});
Demo.insert({isPrivate: false, restrictedField: 'PRIVATE', date: new Date()});

const restrictedDemoId = Demo.insert({
    isPrivate: false,
    restrictedField: 'PRIVATE'
});

Demo.getLink(restrictedDemoId, 'restrictedLink').set({
    test: true
});

// INTERSECTION TEST LINKS

const intersectId = Intersect.insert({
    value: 'Hello',
    privateValue: 'Bad!'
});

const intersectId2 = Intersect.insert({
    value: 'Goodbye',
    privateValue: 'Bad!'
});

const intersectLinkId = IntersectLink.insert({
    value: 'Hello, I am a Link',
    privateValue: 'Bad!'
});

Intersect.getLink(intersectId, 'link').set(intersectLinkId);
Intersect.getLink(intersectId, 'privateLink').set(intersectLinkId);
IntersectLink.getLink(intersectLinkId, 'myself').set(intersectLinkId);
