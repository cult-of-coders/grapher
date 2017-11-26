import {EJSON} from 'meteor/ejson';

export default function(queryName, params) {
    return `${queryName}::${EJSON.stringify(params)}`;
}