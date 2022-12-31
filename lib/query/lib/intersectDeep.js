import {_} from 'meteor/underscore';
import {specialFields} from './createGraph';

const EXTENDED_SPECIAL_FIELDS = [...specialFields, '$filter', '$paginate'];

function isClientValueValid(value) {
    if (_.isObject(value) && !Array.isArray(value)) {
        return _.values(value).every(nestedValue => isClientValueValid(nestedValue));
    }
    else if (value === 1) {
        return true;
    }
    return false;
}

/**
 * 
 * Recursive function which intersects the fields of the body objects.
 * 
 * @param {object} allowed allowed body object - intersection can only be a subset of it
 * @param {object} client client body - can shrink main body, but not expand
 */
function intersectFields(allowed, client) {
    const intersection = {};
    _.pairs(client).forEach(([field, clientValue]) => {
        if (_.contains(EXTENDED_SPECIAL_FIELDS, field)) {
            return;
        }

        const serverValue = allowed[field];
        if (serverValue === 1) { // server allows everything
            if (isClientValueValid(clientValue)) {
                intersection[field] = clientValue;
            }
        }
        else if (_.isObject(serverValue)) {
            if (_.isObject(clientValue) && !Array.isArray(clientValue)) {
                intersection[field] = intersectFields(serverValue, clientValue);
            }
            else if (clientValue === 1) {
                // if client wants everything, serverValue is more restrictive here
                intersection[field] = serverValue;
            }
        }
    });
    return intersection;
}

/**
 * Given a named query that has a specific body, you can query its subbody
 * This performs an intersection of the bodies allowed in each
 *
 * @param allowedBody
 * @param clientBody
 */
export default function (allowedBody, clientBody) {
    const build = intersectFields(allowedBody, clientBody);
    // Add back special fields to the new body
    Object.assign(build, _.pick(allowedBody, ...EXTENDED_SPECIAL_FIELDS));
    return build;
}
