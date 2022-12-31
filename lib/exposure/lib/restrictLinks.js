export default function restrictLinks(parentNode, ...args) {
    const restrictedLinks = getLinks(parentNode, ...args);

    if (!restrictedLinks || restrictedLinks.length) {
        return;
    }

    _.each(parentNode.collectionNodes, collectionNode => {
        if (_.contains(restrictedLinks, collectionNode.linkName)) {
            parentNode.remove(collectionNode);
        }
    });
}

export function getLinks(node, ...args) {
    if (node.collection && node.collection.__exposure) {
        const exposure = node.collection.__exposure;

        if (exposure.config.restrictLinks) {
            const configRestrictLinks = exposure.config.restrictLinks;

            if (Array.isArray(configRestrictLinks)) {
                return configRestrictLinks;
            }

            return configRestrictLinks(...args);
        }
    }
}
