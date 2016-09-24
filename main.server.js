import './lib/exposure/extension.js';
import './lib/links/extension.js';
import './lib/query/extension.js';
import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

checkNpmVersions({
    'sift': '3.2.x'
}, 'cultofcoders:grapher');

export {
    default as createQuery
} from './lib/query/createQuery.js';

export {
    default as Exposure
} from './lib/exposure/exposure.js';