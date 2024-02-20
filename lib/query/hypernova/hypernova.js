import applyProps from '../lib/applyProps.js';
import prepareForDelivery from '../lib/prepareForDelivery.js';
import storeHypernovaResults from './storeHypernovaResults.js';

/**
 *
 * @param {*} collectionNode
 * @param {string} [userId]
 */
async function hypernova(collectionNode, userId) {
  for await (const childCollectionNode of collectionNode.collectionNodes) {
    await storeHypernovaResults(childCollectionNode, userId);
    await hypernova(childCollectionNode, userId);
  }
}

/**
 *
 * @template P={Grapher.Params}
 *
 * @param {*} collectionNode
 * @param {string} [userId]
 * @param {Grapher.HypernovaConfig<P>} [config]
 * @returns
 */
export default async function hypernovaInit(
  collectionNode,
  userId,
  config = {},
) {
  const bypassFirewalls = config.bypassFirewalls || false;
  const params = config.params || {};

  let { filters, options } = applyProps(collectionNode);

  const collection = collectionNode.collection;

  collectionNode.results = await collection
    .find(filters, options, userId)
    .fetchAsync();

  const userIdToPass = config.bypassFirewalls ? undefined : userId;
  await hypernova(collectionNode, userIdToPass);

  prepareForDelivery(collectionNode, params);

  return collectionNode.results;
}
