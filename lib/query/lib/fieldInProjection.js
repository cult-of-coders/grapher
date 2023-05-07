/**
 * Helper method which expands profile.phone.verified into
 * ['profile', 'profile.phone', 'profile.phone.verified']
 * @param fieldName
 */
export function expandField(fieldName) {
    const parts = fieldName.split('.');
    const result = [];

    for (let i = 0; i < parts.length; i++) {
        result.push(parts.slice(0, i + 1).join('.'));
    }

    return result;
}

export function isFieldInProjection(projection, fieldName, checkNested) {
    // for checkNested flag expand the field
    const fields = checkNested ? expandField(fieldName) : [fieldName];
    return fields.some(field => projection[field]);
}
