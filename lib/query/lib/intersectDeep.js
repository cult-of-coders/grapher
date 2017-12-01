import dot from 'dot-object';
import {_} from 'meteor/underscore';

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

    const intersection = _.intersection(allowedBodyDot, clientBodyDot);

    const build = {};
    intersection.forEach(intersectedField => {
        build[intersectedField] = 1;
    });

    return dot.object(build);
}