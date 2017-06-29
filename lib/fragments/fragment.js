import compileFragment from './lib/compileFragment';

export default class Fragment {
    constructor(collection, name, definition) {
        this.collection = collection;
        this.name = name;
        this.definition = definition;
        this._compiled = null;

        this._validateFragment();
    }

    assemble() {
        if (!this._compiled) {
            this._compiled = compileFragment(this.collection, this.name, this.definition);
        }

        return this._compiled;
    }

    _validateFragment() {

    }
}
