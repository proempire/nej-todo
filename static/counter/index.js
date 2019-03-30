NEJ.define([
    'util/ajax/xdr'
], function(_j) {
    const _id = _j._$request('http://localhost:3000/places', {
        sync: true,
        type: 'json',
        method: 'get',
        timeout: 3000,
        mode: 0,
        onload(_data) {
            console.log('successfully get data', _data);
        },
        onerror(_error) {
            console.error(_error);
        }
    });
})