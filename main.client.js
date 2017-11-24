import './lib/links/extension.js';
import './lib/query/extension.js';
import './lib/query/reducers/extension.js';
import './lib/namedQuery/_extension.js'; //deprecated

export {
    default as createQuery
} from './lib/query/createQuery.js';

export {
    default as createNamedQuery
} from './lib/namedQuery/_createNamedQuery.js'; //deprecated

export {
    default as prepareForProcess
} from './lib/query/lib/prepareForProcess';

export { Types } from './lib/constants';
