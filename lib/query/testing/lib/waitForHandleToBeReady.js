export default (handle) => {
    return new Promise((resolve, reject) => {
        Tracker.autorun(c => {
            if (handle.ready()) {
                c.stop();

                resolve();
            }
        })
    })
};