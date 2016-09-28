const logger = function(enabled, name, fn) {
    if (enabled) {
        const start = new Date();
        fn();
        const end = new Date();

        var time = end.getTime() - start.getTime();
        logger.log(true, `${name} [${time}ms]`);

    } else {
        fn();
    }
};

logger.log = (debug, ...args) => {
    if (debug) {
        console.log(...args);
    }
};

export default logger;
