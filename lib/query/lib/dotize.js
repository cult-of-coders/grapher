// https://github.com/vardars/dotize
export default dotize = {};

dotize.convert = function(obj, prefix) {
    if ((!obj || typeof obj != "object") && !Array.isArray(obj)) {
        if (prefix) {
            var newObj = {};
            newObj[prefix] = obj;
            return newObj;
        } else {
            return obj;
        }
    }

    var newObj = {};

    function recurse(o, p, isArrayItem) {
        for (var f in o) {
            if (o[f] && typeof o[f] === "object") {
                if (Array.isArray(o[f])) {
                    if (isEmptyArray(o[f])) {
                        newObj[getFieldName(f, p, true)] = o[f]; // empty array
                    } else {
                        newObj = recurse(o[f], getFieldName(f, p, false, true), true); // array
                    }
                } else {
                    if (isArrayItem) {
                        if (isEmptyObj(o[f])) {
                            newObj[getFieldName(f, p, true)] = o[f]; // empty object
                        } else {
                            newObj = recurse(o[f], getFieldName(f, p, true)); // array item object
                        }
                    } else {
                        if (isEmptyObj(o[f])) {
                            newObj[getFieldName(f, p)] = o[f]; // empty object
                        } else {
                            newObj = recurse(o[f], getFieldName(f, p)); // object
                        }
                    }
                }
            } else {
                if (isArrayItem || isNumber(f)) {
                    newObj[getFieldName(f, p, true)] = o[f]; // array item primitive
                } else {
                    newObj[getFieldName(f, p)] = o[f]; // primitive
                }
            }
        }

        if (isEmptyObj(newObj))
            return obj;

        return newObj;
    }

    function isNumber(f) {
        return !isNaN(parseInt(f));
    }

    function isEmptyObj(obj) {
        for (var prop in obj) {
            if (Object.hasOwnProperty.call(obj, prop))
                return false;
        }

        return true;
    }

    function isEmptyArray(o) {
        if (Array.isArray(o) && o.length == 0)
            return true;
        return false;
    }

    function getFieldName(field, prefix, isArrayItem, isArray) {
        if (isArray)
            return (prefix ? prefix : "") + (isNumber(field) ? "[" + field + "]" : "." + field);
        else if (isArrayItem)
            return (prefix ? prefix : "") + "[" + field + "]";
        else
            return (prefix ? prefix + "." : "") + field;
    }

    return recurse(obj, prefix, Array.isArray(obj));
};