import createQuery from '../query/createQuery.js'

export default (...args) => {
    console.warn('createNamedQuery is deprecated. Functionality has been moved over to createQuery');
    return createQuery(...args);
}
