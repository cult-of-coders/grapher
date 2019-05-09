/**
 * Helper method which expands profile.phone.verified into
 * ['profile', 'profile.phone', 'profile.phone.verified']
 * @param fieldName
 */
export function expandField(fieldName) {
    return fieldName.split('.').reduce((acc, key) => {
        if (acc.length === 0) {
            return [key];
        }
        const [last] = acc;
        return [...acc, `${last}.${key}`];
    }, [])
}

export function isFieldInProjection(projection, fieldName, checkNested) {
    // for checkNested flag expand the field
    const fields = checkNested ? expandField(fieldName) : [fieldName];
    return fields.some(field => projection[field]);
}
