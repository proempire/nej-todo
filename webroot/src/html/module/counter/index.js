NEJ.define([
    'base/klass',
    'base/element',
    'base/event',
    'util/dispatcher/module',
    'util/list/page',
    'util/template/tpl',
    'util/ajax/xdr',
    'pro/module/module',
    'pro/cache/item'
], function (_k, _el, _v, _e, _t0, _t1, _j, _t, _d, _p) {
    // variable declaration
    var _pro;
    /**
     * 项目模块对象
     * @class   {_$$ModuleDemo}
     * @extends {_$$Module}
     * @param   {Object} 可选配置参数
     */
    _p._$$ModuleDemo = _k._$klass();
    _pro = _p._$$ModuleDemo._$extend(_t._$$Module);
    /**
     * 构建模块，主要处理以下业务逻辑
     * - 构建模块结构
     * - 缓存后续需要使用的节点
     * - 初始化需要使用的组件的配置信息
     * @return {Void}
     */
    _pro.__doBuild = function () {
        this.__super();
        this.__body = _e._$html2node(
            _t1._$getTextTemplate('jst-counter')
        );
        // 0 - list box
        // 1 - pager box
        var _list = _e._$getByClassName(this.__body, 'jst-counter-list');
        this.__mopt = {
            limit: 15,
            parent: _list[0],
            item: 'jst-counter-list-item',
            cache: { klass: _d._$$CacheItem }
        };
    };
    /**
     * 显示模块，主要处理以下业务逻辑
     * - 添加事件
     * - 分配组件
     * - 处理输入信息
     * @param  {Object} 输入参数
     * @return {Void}
     */
    _pro.__onShow = function (_options) {
        this.__super(_options);
        // 添加系统预定义事件
        _v._$addEvent(
            'item-add', 'click', function (_event) {
                _j._$request('/items/add', {
                    method: 'POST',
                    type: 'json',
                    data: { id: _el._$get('span-id-item-id').innerHTML },
                    onload: this.__cbListLoad._$bind(this, _key, _callback),
                    onerror: this.__cbListLoad._$bind(this, _key, _callback, _o)
                });
            }, false
        );
        _v._$addEvent(
            'item-delete', 'click', function (_event) {
                _j._$request('/items/delete', {
                    method: 'POST',
                    type: 'json',
                    data: { id: _el._$get('span-id-item-id').innerHTML },
                    onload: this.__cbListLoad._$bind(this, _key, _callback),
                    onerror: this.__cbListLoad._$bind(this, _key, _callback, _o)
                });
            }, false
        );
        _v._$addEvent(
            'jst-counter-new', 'click', function (_event) {
                _j._$request('/items/new', {
                    method: 'POST',
                    type: 'json',
                    data: { name: _el._$get('input-id-counter-new').value },
                    onload: this.__cbListLoad._$bind(this, _key, _callback),
                    onerror: this.__cbListLoad._$bind(this, _key, _callback, _o)
                });
            }, false
        );
    };
    /**
     * 刷新模块，主要处理以下业务逻辑
     * - 分配组件，分配之前需验证
     * - 处理输入信息
     * - 同步状态
     * - 载入数据
     * @return {Void}
     */
    _pro.__onRefresh = (function () {
        var _doParseCKey = function (_param) {
            if (!!_param.cid)
                return 'class-' + _param.cid;
            if (!!_param.tid)
                return 'tag-' + _param.tid;
            return 'box-' + (_param.box || 1);
        };
        return function (_options) {
            this.__super(_options);
            if (this.__lmdl) this.__lmdl._$recycle();
            this.__mopt.cache.lkey = _doParseCKey(_options.param || _o);
            this.__lmdl = _t0._$$ListModulePG._$allocate(this.__mopt);
        };
    })();
    /**
     * 隐藏模块，主要处理以下业务逻辑
     * - 回收事件
     * - 回收组件
     * - 尽量保证恢复到构建时的状态
     * @return {Void}
     */
    _pro.__onHide = function () {
        this.__super();
        // TODO
    };
    // notify dispatcher
    _e._$regist(
        'counter',
        _p._$$ModuleDemo
    );

    return _p;
});