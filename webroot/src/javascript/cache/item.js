/*
 * ------------------------------------------
 * 日志缓存对象实现文件
 * @version  1.0
 * @author   genify(caijf@corp.netease.com)
 * ------------------------------------------
 */
NEJ.define([
    'base/klass',
    'base/util',
    'util/ajax/xdr',
    './cache.js'
], function (_k, _u, _j, _t, _p, _o, _f, _r) {
    var _pro;
    /**
     * item缓存对象
     * @class   {_$$CacheItem}
     * @extends {_$$Cache}
     * @param   {Object}  可选配置参数，已处理参数列表如下所示
     */
    _p._$$CacheItem = NEJ.C();
    _pro = _p._$$CacheItem._$extend(_t._$$Cache);
    /**
     * 从服务器载入数据
     */
    _pro.__doLoadList = function (_options) {
        var _key = _options.key,
            _callback = _options.onload;

        // for test
        if (DEBUG) {
            var _list = window['item-list']
            [(parseInt(_key.split('-')[1]) || 0) % 10],
                _limit = _options.limit,
                _offset = _options.offset;
            var _json = {
                code: 1,
                result: {
                    total: _list.length,
                    list: _list.slice(_offset, _offset + _limit)
                }
            };
            window.setTimeout(
                this.__cbListLoad._$bind(
                    this, _key, _callback, _json), 1000
            );
            return;
        }
        // end for test

        _j._$request('/items', {
            method: 'GET',
            type: 'json',
            onload: this.__cbListLoad._$bind(this, _key, _callback),
            onerror: this.__cbListLoad._$bind(this, _key, _callback, _o)
        });
    };

    return _p;
});
