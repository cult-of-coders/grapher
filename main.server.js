import './lib/exposure/extension.js';

import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';
checkNpmVersions({
    'sift': '3.2.x'
}, 'cultofcoders:grapher');