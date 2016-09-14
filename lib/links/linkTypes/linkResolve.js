export default class LinkResolve {
    constructor(linker, object) {
        this.linker = linker;
        this.object = object;
    }

    find(...args) {
        const config = this.linker.linkConfig;

        return config.resolve(this.object, ...args);
    }

    fetch(...args) {
        return this.find(...args);
    }
}