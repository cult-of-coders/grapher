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

    // include nested fields directly in the nested documents
    'meta.project': {
        collection: Projects,
        type: 'one',
        field: 'meta.projectId',
    },
    'metas.project': {
        collection: Projects,
        type: 'one',
        field: 'metas.projectId',
    },
    'meta.projects': {
        collection: Projects,
        type: 'many',
        // metas is an array
        field: 'metas.projectId',
    },
});
