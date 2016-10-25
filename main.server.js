import './lib/exposure/extension.js';
import './lib/links/extension.js';
import './lib/query/extension.js';
import './lib/namedQuery/expose/extension.js';
import './lib/namedQuery/extension.js';

import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

checkNpmVersions({
    'sift': '3.2.x'
}, 'cultofcoders:grapher');

export {
    default as createQuery
} from './lib/query/createQuery.js';

export {
    default as createNamedQuery
} from './lib/namedQuery/createNamedQuery.js';

export {
    default as Exposure
} from './lib/exposure/exposure.js';

export {
    default as getDocumentationObject
} from './lib/documentor/index.js';