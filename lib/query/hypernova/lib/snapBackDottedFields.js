import {SAFE_DOTTED_FIELD_REPLACEMENT} from '../constants';
import dot from 'dot-object';

export default function (aggregationResult) {
    aggregationResult.forEach(result => {
        result.data = result.data.map(document => {
            _.each(document, (value, key) => {
                if (key.indexOf(SAFE_DOTTED_FIELD_REPLACEMENT) >= 0) {
                    document[key.replace(SAFE_DOTTED_FIELD_REPLACEMENT, '.')] = value;
                    delete document[key];
                }
            });

            return dot.object(document);
        })
    })
}