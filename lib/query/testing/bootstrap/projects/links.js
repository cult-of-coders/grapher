import {Projects} from './collection';
import {Files} from '../files/collection';

Projects.addLinks({
    files: {
        collection: Files,
        inversedBy: 'project',
    },
    filesMany: {
        collection: Files,
        inversedBy: 'projects',
    },
});
