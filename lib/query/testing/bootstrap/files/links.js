import {Files} from './collection';
import {Projects} from '../projects/collection';

Files.addLinks({
    project: {
        collection: Projects,
        type: 'one',
        field: 'meta.projectId',
    },
    projects: {
        collection: Projects,
        type: 'many',
        // metas is an array
        field: 'metas.projectId',
    },
});
