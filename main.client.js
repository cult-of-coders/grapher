import './lib/links/extension.js';
import './lib/query/extension.js';
import './lib/query/reducers/extension.js';
import './lib/namedQuery/_extension.js'; //deprecated

export {
    default as createQuery
} from './lib/query/createQuery.js';

export {
    default as prepareForProcess
} from './lib/query/lib/prepareForProcess';

export {
    default as Query
} from './lib/query/query.client';

export {
    default as NamedQuery
} from './lib/namedQuery/namedQuery.client';
