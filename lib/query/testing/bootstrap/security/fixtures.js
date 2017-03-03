import { Items, SubItems } from './collection';

Items.remove({});
SubItems.remove({});

const itemsId = Items.insert({text: 'hello'});

Items.getLink(itemsId, 'subitems').add({
    text: 'hello from subitem'
});