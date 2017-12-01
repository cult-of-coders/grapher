import deepExtend from 'deep-extend';

export default function (...args) {
    return deepExtend({}, ...args);
}