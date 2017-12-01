/**
 * This method creates a "fake" subscription handle so that users of CountSubscription#subscribe
 * have an interface consistent with normal subscriptions.
 *
 * @param {CountSubscription} countManager
 */
export default (countManager) => ({
    ready: () => countManager.accessToken.get() !== null && countManager.subscriptionHandle.ready(),
    stop: () => countManager.unsubscribe(),
});
