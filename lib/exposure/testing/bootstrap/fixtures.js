import { Exposure } from 'meteor/cultofcoders:grapher';

Exposure.setConfig({
  maxLimit: 5,
});

import Demo, {
  DemoPublication,
  DemoMethod,
  DemoRestrictedLink,
} from './demo.js';
import Intersect, { CollectionLink as IntersectLink } from './intersect';

await Demo.removeAsync({});
await DemoRestrictedLink.removeAsync({});

await Intersect.removeAsync({});
await IntersectLink.removeAsync({});

await Demo.insertAsync({ isPrivate: true, restrictedField: 'PRIVATE' });
await Demo.insertAsync({ isPrivate: false, restrictedField: 'PRIVATE' });
await Demo.insertAsync({
  isPrivate: false,
  restrictedField: 'PRIVATE',
  date: new Date(),
});

const restrictedDemoId = await Demo.insertAsync({
  isPrivate: false,
  restrictedField: 'PRIVATE',
});

await (
  await Demo.getLink(restrictedDemoId, 'restrictedLink')
).set({
  test: true,
});

// INTERSECTION TEST LINKS

const intersectId = await Intersect.insertAsync({
  value: 'Hello',
  privateValue: 'Bad!',
});

const intersectId2 = await Intersect.insertAsync({
  value: 'Goodbye',
  privateValue: 'Bad!',
});

const intersectLinkId = await IntersectLink.insertAsync({
  value: 'Hello, I am a Link',
  privateValue: 'Bad!',
});

await (await Intersect.getLink(intersectId, 'link')).set(intersectLinkId);
await (
  await Intersect.getLink(intersectId, 'privateLink')
).set(intersectLinkId);
await (
  await IntersectLink.getLink(intersectLinkId, 'myself')
).set(intersectLinkId);
