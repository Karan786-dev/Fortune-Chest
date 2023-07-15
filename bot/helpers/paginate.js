module.exports = function (arr, size) {
    size = size || 2;
    return arr.reduce((acc, val, i) => {
        let idx = Math.floor(i / size);
        let page = acc[idx] || (acc[idx] = []);
        page.push(val);
        return acc;
    }, []);
};