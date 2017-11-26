import './lib/aggregate';
import './lib/exposure/extension.js';
import './lib/links/extension.js';
import './lib/query/extension.js';
import './lib/query/reducers/extension.js';
import './lib/namedQuery/expose/extension.js';
import './lib/namedQuery/_extension.js'; //deprecated

export {
    default as createQuery
} from './lib/query/createQuery.js';

export {
    default as createNamedQuery
} from './lib/namedQuery/_createNamedQuery.js'; //deprecated

export {
    default as Exposure
} from './lib/exposure/exposure.js';

export {
    default as getDocumentationObject
} from './lib/documentor/index.js';

export {
    default as MemoryResultCacher
} from './lib/namedQuery/cache/MemoryResultCacher';
