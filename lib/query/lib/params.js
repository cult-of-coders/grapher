export class Params {
    constructor(data = {}) {
        this.data = {};

        _.each(_.keys(data), k => {
            this.set(k, data[k]);
        });
    }

    all() {
        return this.data;
    }

    get(field) {
        return this.data[name] ? this.data[name].get() : undefined;
    }

    set(field, value) {
        if (_.isObject(field)) {
            _.each(field, (value, key) => {
                this.set(key, value);
            });

            return;
        }

        if (value instanceof ReactiveVar) {
            this.data[name] = value;
        } else {
            if (!this.data[name]) {
                this.data[name] = new ReactiveVar(value);
            } else {
                this.data[name].set(value);
            }
        }
    }
}