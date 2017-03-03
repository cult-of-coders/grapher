import { Items, SubItems } from './collection';

Items.addLinks({
    'subitems': {
        collection: SubItems,
        field: 'subitemsIds',
        type: 'many'
    }
});