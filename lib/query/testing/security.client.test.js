import { assert } from 'chai';
import { createQuery } from 'meteor/cultofcoders:grapher';
import waitForHandleToBeReady from './lib/waitForHandleToBeReady';

describe('Query Security Client Tests', function () {
    it('Should not retrieve subitems with reactive and non-reactive query', async function () {
        const query = createQuery({
            security_items: {
                text: 1,
                subitems: {
                    text: 1
                }
            }
        });

        const handle = query.subscribe();

        await waitForHandleToBeReady(handle);

        const data = query.fetch();

        assert.lengthOf(data, 1);
        assert.lengthOf(data[0].subitems, 0);
    });
});