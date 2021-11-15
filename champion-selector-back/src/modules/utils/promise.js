function promiseMerge(promiseIterable, dataFromPrevious) {
    return Promise.all(
        promiseIterable.map(async ([ name, work ]) => {
            let prom = work;

            if (typeof work === 'function') {
                const data = await dataFromPrevious;
                prom = work(data);
            }

            return prom.then((data) => Promise.resolve({ [name]: data }));
        })
    )
        .then((toMerge) => Object.assign({}, ...toMerge));
}

export async function promiseQueue(iterableQueue) {
    return iterableQueue.reduce(async (final, item) => {
        return Object.assign({}, final, await promiseMerge(item, final));
    }, {});
}
