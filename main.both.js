import './lib/links/extension.js';
import './lib/query/extension.js';

export {
    default as createQuery
} from './lib/query/createQuery.js';

export {
    default as createGraph
} from './lib/query/lib/createGraph.js';

export {
    default as recursiveFetch
} from './lib/query/lib/recursiveFetch.js';

export {
    default as recursiveCompose
} from './lib/query/lib/recursiveCompose.js';

export {
    default as applyFilterFunction
} from './lib/query/lib/applyFilterFunction.js';