import dot from 'dot-object';
import {_} from 'meteor/underscore';
import {specialFields} from './createGraph';

const EXTENDED_SPECIAL_FIELDS = [...specialFields, '$filter', '$paginate'];

/**
 * Given a named query that has a specific body, you can query its subbody
 * This performs an intersection of the bodies allowed in each
 *
 * @param allowedBody
 * @param clientBody
 */
export default function (allowedBody, clientBody) {
    const allowedBodyDot = _.keys(dot.dot(allowedBody));
    const clientBodyDot = _.keys(dot.dot(clientBody));

    // Intersect only actual database fields
    const intersection = _.difference(_.intersection(allowedBodyDot, clientBodyDot), EXTENDED_SPECIAL_FIELDS);

    const build = {};
    intersection.forEach(intersectedField => {
        build[intersectedField] = 1;
    });

    // Add back special fields to the new body
    Object.assign(build, _.pick(allowedBody, ...EXTENDED_SPECIAL_FIELDS));
    return dot.object(build);
}