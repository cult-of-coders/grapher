import createGraph from '../query/lib/createGraph.js';
import recursiveCompose from '../query/lib/recursiveCompose.js';
import recursiveFetch from '../query/lib/recursiveFetch.js';

export default class Exposure {
    constructor(collection, firewall) {
        this.collection = collection;
        this.firewall = firewall;
        this.name = `exposure_${collection._name}`;

        this.initSecurity();
        this.initMethod();
        this.initPublication();
    }

    initPublication() {
        const collection = this.collection;

        Meteor.publishComposite(this.name, function (body) {
            return recursiveCompose(
                createGraph(collection, body),
                this.userId
            );
        });
    }

    initMethod() {
        const collection = this.collection;

        Meteor.methods({
            [this.name](body) {
                return recursiveFetch(
                    createGraph(collection, body),
                    null,
                    this.userId
                );
            }
        })
    }

    initSecurity() {
        const collection = this.collection;
        const firewall = this.firewall;

        collection.__isExposedForGrapher = true;

        if (firewall) {
            collection.firewall = (filters, options, userId) => {
                if (userId !== undefined) {
                    firewall(filters, options, userId);
                }
            };

            collection.findSecure = (filters, options, userId) => {
                collection.firewall(filters, options, userId);

                return collection.find(filters, options);
            }
        }
    }
}