import { Items, SubItems } from './collection';

await Items.removeAsync({});
await SubItems.removeAsync({});

const itemsId = await Items.insertAsync({ text: 'hello' });

await (
  await Items.getLink(itemsId, 'subitems')
).add({
  text: 'hello from subitem',
});
