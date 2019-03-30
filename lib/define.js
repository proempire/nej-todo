(function(d,p){
    var __config = {root:{/*lib,pro,platform*/}/*native,charset,global,platform*/},
        __xqueue  = [], // item:{n:'filename',d:[/* dependency list */],p:[/* platform list */],h:[/* patch list */],f:function}
        __scache = {}, // uri:STATE   0-loading  1-waiting  2-defined
        __rcache = {}, // uri:RESULT
        __stack  = [], // for define stack
        __platform;
    /*
     * æ˜¾ç¤ºæ—¥å¿—
     * @param  {String} _msg æ—¥å¿—å†…å®¹
     * @return {Void}
     */
    var _doLog = (function(){
        var _div,_div1,_css1 = {cursor:'pointer',textAlign:'center',backgroundColor:'#ddd'},
            _css = {display:'none',position:'absolute',top:0,right:0,boder:'1px solid #aaa',overflow:'auto',height:'300px',width:'400px',zIndex:'1000',fontSize:'12px',color:'#fff',backgroundColor:'#000',lineHeight:'20px',textAlign:'left'};
        return function(_msg){
            if (!_div){
                _div = document.createElement('div');
                var _style = _div.style;
                for(var x in _css)
                    _style[x] = _css[x];
                document.body.appendChild(_div);
                _div1 = document.createElement('div');
                _div1.title = 'å…³é—­æŽ§åˆ¶å°ä¿¡æ¯';
                _div1.innerHTML = 'Ã—';
                _style = _div1.style;
                for(var x in _css1)
                    _style[x] = _css1[x];
                _div.appendChild(_div1);
                _div1.onclick = function(){_div.style.display='none';};
                document.attachEvent('onkeypress',function(_event){
                    // press ~ to show console
                    if (_event.keyCode==96)
                        _div.style.display = 'block';
                });
            }
            var p = document.createElement('div');
            p.innerHTML = _msg;
            _div1.insertAdjacentElement('afterEnd',p);
        };
    })();
    /*
     * æ–‡ä»¶åˆå§‹åŒ–
     * @return {Void}
     */
    var _doInit = function(){
        if (!p.console)
            p.console = {log:_doLog,warn:_doLog};
        // do init add loaded script and remove node
        var _list = d.getElementsByTagName('script');
        if (!_list||!_list.length) return;
        var _reg = /\/define(?:\.cmp)?\.js(?=\?|#|$)/;
        for(var i=_list.length-1,_script;i>=0;i--){
            _script = _list[i];
            _script.xxx = !0;
            _reg.test(_script.src)
                ? _doParseConfig(_script.src)
                : _doScriptLoaded(_script,!0);
        }
        if (!__config.global&&!p.define){
            p.define = NEJ.define;
        }
    };
    /*
     * è§£æžåœ°å€
     * @param  {String}
     * @return {Void}
     */
    var _doParseConfig = function(_uri){
        _uri = _doFormatURI(_uri);
        if (!_uri) return;
        var _arr = _uri.split(/[?#]/),
            _brr = _arr[0].split('/');
        _brr.pop(); // splice define.js
        __config.root.lib = _brr.join('/')+'/';
        var _obj = _doStr2Obj(_arr[1]);
        __config.charset = _obj.c||'utf-8';
        __config.global = _obj.g=='true';
        delete _obj.c;
        delete _obj.g;
        _doParsePlatform(_obj.p);
        delete _obj.p;
        var _deps = _obj.d;
        delete _obj.d;
        var _root = __config.root;
        for(var x in _obj){
            _root[x] = _obj[x];
        }
        _root.platform = './platform/';
        if (!_root.pro){
            _root.pro = '../javascript/';
        }
        if (!!_deps){
            document.write('<script src="'+_deps+'"></scr'+'ipt>');
        }
    };
    /*
     * è§£æžåˆ—è¡¨ä¾èµ–å…³ç³»
     * @return {Array} åˆ—è¡¨
     */
    var _doParseDependency = (function(){
        var _dependency = function(_list,_dmap,_test){
            if (!_list||!_list.length)
                return null;
            var _result = [];
            for(var i=0,l=_list.length,_file,_files;i<l;i++){
                _file = _list[i];
                if (!!_test[_file])
                    continue;
                _test[_file] = !0;
                _files = _dependency(_dmap[_file],_dmap,_test);
                if (!!_files&&_files.length>0)
                    _result.push.apply(_result,_files);
                _result.push(_file);
            }
            return _result;
        };
        return function(_list,_dmap){
            return _dependency(_list,_dmap,{});
        };
    })();
    /*
     * åºåˆ—åŒ–é…ç½®ä¾èµ–å…³ç³»
     * @return {Void}
     */
    var _doSerializeDepList = function(_map){
        if (!_map) return;
        // format url
        var _xlist = [],
            _result = {};
        for(var x in _map){
            var _list = _map[x],
                _file = _doFormatURI(x);
            _xlist.push(_file);
            _result[_file] = _list;
            if (!_list||!_list.length) continue;
            for(var i=0,l=_list.length;i<l;i++){
                _list[i] = _doFormatURI(_list[i]);
            }
        }
        // merge result
        return _doParseDependency(_xlist,_result);
    };
    /*
     * è§£æžæ’ä»¶ä¿¡æ¯
     * @param  {String} _uri åœ°å€
     * @return {Array}       æ’ä»¶ä¿¡æ¯
     */
    var _doParsePlugin = (function(){
        var _pmap = {
            text:function(_uri){
                _doLoadText(_uri);
            },
            json:function(_uri){
                _doLoadJSON(_uri);
            },
            regular:function(_uri){
                _doLoadText(_uri);
            }
        };
        return function(_uri){
            var _brr = [],
                _type = null,
                _arr = _uri.split('!'),
                _fun = _pmap[_arr[0].toLowerCase()];
            if (!!_fun){
                _type = _arr.shift();
            }
            _brr.push(_arr.join('!'));
            _brr.push(_fun||_doLoadScript);
            _brr.push(_type);
            return _brr;
        };
    })();
    /*
     * åˆå§‹åŒ–å¹³å°ä¿¡æ¯
     * @param  {String} _config å¹³å°é…ç½®ä¿¡æ¯
     * @return {Void}
     */
    var _doParsePlatform = (function(){
        var _reg0 = /(cef|ios|win|android)/,
            _emap = {gk:'G',wk:'W',td:'T'};
        return function(_config){
            _config = _config||'td|gk|wk';
            var _root = __config;
            // hybrid development
            if (_reg0.test(_config)){
                var _name = RegExp.$1;
                _root.platform = _name=='win'?/T/i:/W/i;
                _root.native = '{lib}native/'+_name+'/';
                return;
            }
            // parse platform
            var _reg = [];
            for(var x in _emap){
                if (_config.indexOf(x)>=0){
                    _reg.push(_emap[x]);
                }
            }
            _root.platform = new RegExp(_reg.join('|'),'i');
        };
    })();
    /*
     * è§£æžå¹³å°è¯†åˆ«è¡¨è¾¾å¼
     * @param  {String} å¹³å°è¯†åˆ«ä¸²
     * @return {Object} å¹³å°ä¿¡æ¯ï¼Œ{pkey:'engine',isEngOK:function(_engine){},vkey:'release',isVerOK:function(version){}}
     */
    var _doParsePatchExp = (function(){
        var _reg0 = /\s/g,
            _reg1 = /(TR|WR|GR|TV|WV|GV)/i,
            _reg2 = /([<>=]=?)/,
            _pkey = '[VERSION]',
            _emap = {T:'trident',W:'webkit',G:'gecko'},
            _vmap = {R:'release',V:'version'};
        var _doParseVersion = function(_exp){
            return _exp.replace(_reg2,"'$1'");
        };
        return function(_exp){
            _exp = (_exp||'').replace(_reg0,'');
            if (!_reg1.test(_exp)){
                return null;
            }
            var _key = RegExp.$1,
                _brr = _key.split(''),
                _result = {
                    pkey:'engine',
                    vkey:_vmap[_brr[1]]
                },
                _pstr = _emap[_brr[0]];
            _result.isEngOK = function(_platform){
                return _platform==_pstr;
            };
            var _arr = _exp.split(_key),
                _left = "'"+_doParseVersion(_arr[0])+_pkey+"'",
                _right = "'"+_pkey+_doParseVersion(_arr[1])+"'";
            _result.isVerOK = function(_version){
                var _arr = ['true'];
                if (!!_left){
                    _arr.push(_left.replace(_pkey,_version));
                }
                if (!!_right){
                    _arr.push(_right.replace(_pkey,_version));
                }
                return eval(_arr.join('&&'));
            };
            return _result;
        };
    })();
    /*
     * æ ¹æ®ç»™å®šåœ°å€æŒ‡å®šè¯·æ±‚ç¼–ç 
     * @param  {String} _uri åœ°å€
     * @return {String}      ç¼–ç æ–¹å¼
     */
    var _doParseCharset = function(_uri){
        return _uri.indexOf(__config.root.lib)>=0?'utf-8':__config.charset;
    };
    /*
     * è§£æžå¹³å°ä¾èµ–çš„æ–‡ä»¶
     * @param  {Array} ä¾èµ–åˆ—è¡¨
     * @return {Array} åˆå¹¶äº†å¹³å°ä¿¡æ¯åŽçš„ä¾èµ–åˆ—è¡¨
     */
    var _doMergePlatform = (function(){
        var _reg0 = /\\|\//;
        // {platform}xxx -> ['./platform/xxx','./platform/xxx.patch']
        // {platform}xxx.yy -> ['./platform/xxx.yy','./platform/xxx.patch.yy']
        var _doParsePlatformURI = function(_uri){
            _uri = (_uri||'').replace(
                '{platform}',
                __config.root.platform
            );
            var _arr = _uri.split(_reg0),
                _name = _arr.pop(),
                _path = _arr.join('/')+'/',
                _patch = _name.split('.'),
                _sufix = '';
            if (_patch.length>1){
                _sufix = '.'+_patch.pop();
            }
            return [
                _path+_name,
                _path+_patch.join('.')+'.patch'+_sufix
            ];
        };
        return function(_deps){
            var _ret = {};
            for(var i=0,_it;_it=_deps[i];i++){
                if (_it.indexOf('{platform}')>=0){
                    _it = _doParsePlatformURI(_it);
                    _deps[i] = _it[0];
                    _ret[_it[0]] = _it[1];
                }
            }
            return _ret;
        };
    })();
    /*
     * ä»ŽNEJ.patchä¸­æå–ä¾èµ–åˆ—è¡¨åˆå¹¶è‡³defineä¾èµ–åˆ—è¡¨ä¸­
     * @param  {Array}     defineä¸­çš„ä¾èµ–åˆ—è¡¨
     * @param  {Function}  defineæ‰§è¡Œå‡½æ•°
     * @return {Array}     åˆå¹¶äº†patchåŽçš„ä¾èµ–åˆ—è¡¨
     */
    var _doMergePatched = function(_callback){
        var _func = _callback.toString();
        if (_func.indexOf('NEJ.patch')<0){
            return;
        }
        var _ret = [],
            _map = {},
            _tmp = NEJ.patch,
            _reg = __config.platform;
        NEJ.patch = function(){
            var _args = _doFormatARG.apply(
                null,arguments
            );
            // check platform
            if (!_args[0]||!_args[1]||
                !_reg.test(_args[0])){
                return;
            }
            // merge dependency
            for(var i=0,l=_args[1].length,_it;i<l;i++){
                _it = _args[1][i];
                if (!_map[_it]){
                    _map[_it] = !0;
                    _ret.push(_it);
                }
            }
        };
        try{
            _callback();
        }catch(e){
            // ignore
        }
        NEJ.patch = _tmp;
        return _ret;
    };
    /*
     * åˆ¤æ–­æ˜¯å¦å­—ç¬¦ä¸²
     * @param  {Varable} _data æ•°æ®
     * @param  {String}  _type ç±»åž‹
     * @return {Boolean}       æ˜¯å¦å­—ç¬¦ä¸²
     */
    var _isTypeOf = function(_data,_type){
        return Object.prototype.toString.call(_data)==='[object '+_type+']';
    };
    /*
     * å–äº‹ä»¶è§¦å‘å…ƒç´ 
     * @param  {Event} _event äº‹ä»¶å¯¹è±¡
     * @return {Void}
     */
    var _getElement = function(_event){
        return !_event?null:(_event.target||_event.srcElement);
    };
    /*
     * æŸ¥è¯¢ä¸²è½¬å¯¹è±¡
     * @param  {String} _query æŸ¥è¯¢ä¸²
     * @return {Object}        å¯¹è±¡
     */
    var _doStr2Obj = function(_query){
        var _result = {},
            _list = (_query||'').split('&');
        if (!!_list&&!!_list.length)
            for(var i=0,l=_list.length,_brr,_key;i<l;i++){
                _brr = _list[i].split('=');
                _key = _brr.shift();
                if (!_key) continue;
                _result[decodeURIComponent(_key)] =
                        decodeURIComponent(_brr.join('='));
            }
        return _result;
    };
    /*
     * æ ¼å¼åŒ–åœ°å€,å–ç»å¯¹è·¯å¾„
     * @param  {String} _uri å¾…æ ¼å¼åŒ–åœ°å€
     * @return {String}      æ ¼å¼åŒ–åŽåœ°å€
     */
    var _doFormatURI = (function(){
        var _xxx = !1,
            _reg = /{(.*?)}/gi,
            _reg1= /([^:])\/+/g,
            _reg3= /[^\/]*$/,
            _reg4= /\.js$/i,
            _reg5= /^[{\/\.]/,
            _reg6= /(file:\/\/)([^\/])/i,
            _anchor = d.createElement('a');
        var _absolute = function(_uri){
            return _uri.indexOf('://')>0;
        };
        var _slash = function(_uri){
            return _uri.replace(_reg1,'$1/');
        };
        var _append = function(){
            if (_xxx) return;
            _xxx = !0;
            _anchor.style.display = 'none';
            document.body.appendChild(_anchor);
        };
        var _root = function(_uri) {
            return _uri.replace(_reg3,'');
        };
        var _format = function(_uri){
            _append();
            _anchor.href = _uri;
            _uri = _anchor.href;
            var _ret = 
                _absolute(_uri)&&_uri.indexOf('./')<0 ?
                _uri : _anchor.getAttribute('href',4); // ie6/7
            // fix mac file:// error
            return _uri.replace(_reg6,'$1/$2');
        };
        var _amdpath = function(_uri,_type){
            // start with {xx} or /xx/xx or ./ or ../
            // end with .js
            // absolute uri
            if (_reg4.test(_uri)||
                _reg5.test(_uri)||
                _absolute(_uri)){
                return _uri;
            }
            // lib/base/klass -> {lib}base/klass.js
            // pro/util/a     -> {pro}util/a.js
            var _arr = _uri.split('/'),
                _path = __config.root[_arr[0]],
                _sufx = !_type?'.js':'';
            if (!!_path){
                _arr.shift();
                return _path+_arr.join('/')+_sufx;
            }
            // for base/klass -> {lib}base/klass.js
            return '{lib}'+_arr.join('/')+_sufx;
        };
        return function(_uri,_base,_type){
            if(_isTypeOf(_uri,'Array')){
                var _list = [];
                for(var i = 0; i < _uri.length; i++){
                    _list.push(
                        _doFormatURI(_uri[i],_base,_type)
                    );
                }
                return _list;
            }
            if (!_uri) return '';
            if (_absolute(_uri)){
                return _format(_uri);
            }
            if (_base&&_uri.indexOf('.')==0){
                _uri = _root(_base)+_uri;
            }
            _uri = _slash(_amdpath(_uri,_type));
            var _uri = _uri.replace(
                _reg,function($1,$2){
                    return __config.root[$2]||$2;
                }
            );
            return _format(_uri);
        };
    })();
    /*
     * æ ¼å¼åŒ–è¾“å…¥å‚æ•°
     * @param  {String}   å­—ç¬¦ä¸²
     * @param  {Array}    æ•°ç»„
     * @param  {Function} å‡½æ•°
     * @return {Array}    æ ¼å¼åŒ–åŽçš„å‚æ•°åˆ—è¡¨
     */
    var _doFormatARG = function(_str,_arr,_fun){
        var _args = [null,null,null],
            _kfun = [
                function(_arg){return _isTypeOf(_arg,'String');},
                function(_arg){return _isTypeOf(_arg,'Array');},
                function(_arg){return _isTypeOf(_arg,'Function');}
            ];
        for(var i=0,l=arguments.length,_it;i<l;i++){
            _it = arguments[i];
            for(var j=0,k=_kfun.length;j<k;j++){
                if (_kfun[j](_it)){
                    _args[j] = _it;
                    break;
                }
            }
        }
        return _args;
    };
    /*
     * ä¾¦æµ‹è„šæœ¬è½½å…¥æƒ…å†µ
     * @param  {Node} _script è„šæœ¬èŠ‚ç‚¹
     * @return {Void}
     */
    var _doAddListener = (function(){
        var _statechange = function(_event){
            var _element = _getElement(_event)||this;
            if (!_element) return;
            var _state = _element.readyState;
            if (_state==='loaded'||
                _state==='complete')
                _doScriptLoaded(_element,!0);
        };
        return function(_script){
            _script.onload = function(e){_doScriptLoaded(_getElement(e),!0);};
            _script.onerror = function(e){_doScriptLoaded(_getElement(e),!1);};
            _script.onreadystatechange = _statechange;
        };
    })();
    /*
     * é¡µé¢å·²å­˜åœ¨çš„scriptèŠ‚ç‚¹æ·»åŠ äº‹ä»¶æ£€æµ‹
     * @return {Void}
     */
    var _doAddAllListener = function(){
        var _list = document.getElementsByTagName('script');
        for(var i=_list.length-1,_script;i>=0;i--){
            _script = _list[i];
            if (!_script.xxx){
                _script.xxx = !0;
                !_script.src ? _doClearStack()
                             : _doAddListener(_list[i]);
            }
        }
    };
    /*
     * æ¸…ç†è„šæœ¬èŠ‚ç‚¹
     * @param  {Node} _script è„šæœ¬èŠ‚ç‚¹
     * @return {Void}
     */
    var _doClearScript = function(_script){
        if (!_script||!_script.parentNode) return;
        _script.onload = null;
        _script.onerror = null;
        _script.onreadystatechange = null;
        _script.parentNode.removeChild(_script);
    };
    /*
     * æ£€æŸ¥æ‰€æœ‰æ–‡ä»¶æ˜¯å¦éƒ½è½½å…¥
     * @return {Boolean} æ˜¯å¦éƒ½è½½å…¥
     */
    var _isFinishLoaded = function(){
        for(var x in __scache)
            if (__scache[x]===0)
                return !1;
        return !0;
    };
    /*
     * æ£€æŸ¥åˆ—è¡¨æ˜¯å¦éƒ½è½½å…¥å®Œæˆ
     * @param  {Array} åˆ—è¡¨
     * @return {Void}
     */
    var _isListLoaded = function(_list){
        if (!!_list&&!!_list.length){
            for(var i=_list.length-1;i>=0;i--){
                if (__scache[_list[i]]!==2){
                    return !1;
                }
            }
        }
        return !0;
    };
    /*
     * æ£€æŸ¥é›†åˆæ˜¯å¦éƒ½è½½å…¥å®Œæˆ
     * @param  {Object} é›†åˆ
     * @return {Void}
     */
    var _isMapLoaded = function(_map){
        if (!!_map){
            for(var x in _map){
                if (__scache[_map[x]]!==2){
                    return !1;
                }
            }
        }
        return !0;
    };
    /*
     * è½½å…¥ä¾èµ–æ–‡æœ¬
     * @param  {String} _uri æ–‡æœ¬åœ°å€
     * @return {Void}
     */
    var _doLoadText = (function(){
        var _msid,
            _msxml = [
                'Msxml2.XMLHTTP.6.0',
                'Msxml2.XMLHTTP.3.0',
                'Msxml2.XMLHTTP.4.0',
                'Msxml2.XMLHTTP.5.0',
                'MSXML2.XMLHTTP',
                'Microsoft.XMLHTTP'
            ];
        var _getXHR = function(){
            if (!!p.XMLHttpRequest){
                return new p.XMLHttpRequest();
            }
            if (!!_msid){
                return new ActiveXObject(_msid);
            }
            for(var i=0,l=_msxml.length,_it;i<l;i++){
                try{
                    _it = _msxml[i];
                    var _xhr = new ActiveXObject(_it);
                    _msid = _it;
                    return _xhr;
                }catch(e){
                    // ignore
                }
            }
        };
        return function(_uri,_callback){
            if (!_uri) return;
            var _state = __scache[_uri];
            if (_state!=null) return;
            // load text
            __scache[_uri] = 0;
            var _xhr = _getXHR();
            _xhr.onreadystatechange = function(){
                if (_xhr.readyState==4){
                    var _text = _xhr.responseText||'';
                    __scache[_uri] = 2;
                    __rcache[_uri] = _text;
                    if (!!_callback){
                        _callback(_text);
                    }
                    _doCheckLoading();
                }
            };
            _xhr.open('GET',_uri,!0);
            _xhr.send(null);
        };
    })();
    /*
     * è½½å…¥ä¾èµ–JSON
     * @param  {String} _uri JSONåœ°å€
     * @return {Void}
     */
    var _doLoadJSON = function(_uri){
        _doLoadText(_uri,function(_text){
            var _data;
            try{
                if (!!p.JSON&&!!JSON.parse){
                    _data = JSON.parse(_text);
                }else{
                    _data = eval('('+_text+')');
                }
            }catch(ex){
                _data = null;
            }
            __rcache[_uri] = _data;
        });
    };
    /*
     * è½½å…¥ä¾èµ–è„šæœ¬
     * @param  {String} _uri è„šæœ¬åœ°å€
     * @return {Void}
     */
    var _doLoadScript = function(_uri){
        if (!_uri) return;
        var _state = __scache[_uri];
        if (_state!=null) return;
        // load file
        __scache[_uri] = 0;
        var _script = d.createElement('script');
        _script.xxx = !0;
        _script.type = 'text/javascript';
        _script.charset = _doParseCharset(_uri);
        _doAddListener(_script);
        _script.src = _uri;
        (d.getElementsByTagName('head')[0]||document.body).appendChild(_script);
    };
    /*
     * è„šæœ¬è½½å…¥å®Œæˆå›žè°ƒ
     * @param  {Node}    _script è„šæœ¬èŠ‚ç‚¹å¯¹è±¡
     * @param  {Boolean} _isok   è„šæœ¬è½½å…¥æ˜¯å¦æˆåŠŸ
     * @return {Void}
     */
    var _doScriptLoaded = function(_script,_isok){
        var _uri = _doFormatURI(_script.src);
        if (!_uri) return;
        var _arr = __stack.pop();
        if (!!_arr){
            _arr.unshift(_uri);
            _doDefine.apply(p,_arr);
        }
        // 404 is ok for platform
        if (!!_uri&&__scache[_uri]!=1){
            __scache[_uri] = 2;
        }
        _doClearScript(_script);
        _doCheckLoading();
    };
    /*
     * æœç´¢å¾ªçŽ¯å¼•ç”¨
     * @return {Object} éœ€è§£çŽ¯é¡¹
     */
    var _doFindCircularRef = (function(){
        var _result;
        var _index = function(_array,_name){
            for(var i=_array.length-1;i>=0;i--)
                if (_array[i].n==_name)
                    return i;
            return -1;
        };
        var _loop = function(_item){
            if (!_item) return;
            var i = _index(_result,_item.n);
            if (i>=0) return _item;
            _result.push(_item);
            var _deps = _item.d;
            if (!_deps||!_deps.length) return;
            for(var i=0,l=_deps.length,_citm;i<l;i++){
                _citm = _loop(__xqueue[_index(__xqueue,_deps[i])]);
                if (!!_citm) return _citm;
            }
        };
        var _exec = function(_list,_pmap){
            if (!_pmap) return;
            // find platform patch list
            var _arr = [];
            for(var i=0,l=_list.length,_it;i<l;i++){
                _it = _list[i];
                if (_pmap[_it]){
                    _arr.push(_it);
                }
            }
            // index queue by file name
            var _map = {};
            for(var i=0,l=__xqueue.length,_it;i<l;i++){
                _it = __xqueue[i];
                _map[_it.n] = _it;
            }
            // execute platform patch
            for(var i=0,l=_arr.length,_it,_item;i<l;i++){
                _it = _arr[i];
                // exec hack.js
                _item = _map[_it];
                if (!!_item){
                    _doExecFunction(_item);
                }
                // exec hack.patch.js
                _item = _map[_pmap[_it]];
                if (!!_item){
                    _doExecFunction(_item);
                }
            }
        };
        return function(){
            _result = [];
            // check from begin to end
            var _item = _loop(__xqueue[0]);
            // must do platform before excute
            if (!!_item){
                _exec(_item.d,_item.p);
            }
            return _item;
        };
    })();
    /*
     * æ‰§è¡Œæ–‡ä»¶è„šæœ¬
     * @param  {Object} ç¼“å­˜ä¿¡æ¯
     * @return {Void}
     */
    var _doExecFunction = (function(){
        // dependency inject param
        var _o = {},
            _r = [],
            _f = function(){return !1;};
        // merge inject param
        var _doMergeDI = function(_dep,_map){
            var _arr = [];
            if (!!_dep){
                // merge dependency list result
                for(var i=0,l=_dep.length,_it;i<l;i++){
                    _it = _dep[i];
                    // except for 404 platform
                    if (!__rcache[_it]&&!_map[_it]){
                        __rcache[_it] = {};
                    }
                    // result of (platform.js || platform.patch.js)
                    _arr.push(__rcache[_it]||__rcache[_map[_it]]||{});
                }
            }
            _arr.push({},_o,_f,_r);
            return _arr;
        };
        var _doMergeResult = function(_uri,_result){
            var _ret = __rcache[_uri],
                _iso = {}.toString.call(_result)=='[object Object]';
            if (!!_result){
                if (!_ret||!_iso){
                    // for other type of return
                    _ret = _result;
                }else{
                    // for namespace return
                    _ret = _ret||{};
                    for(var x in _result){
                        _ret[x] = _result[x];
                    }
                }
            }
            __rcache[_uri] = _ret;
            // save platform information
            var _puri = __config.root.lib+'base/platform.js';
            if (_uri===_puri){
                __platform = _ret;
            }
        };
        return function(_item){
            var _args = _doMergeDI(
                _item.d,_item.p
            );
            if (!!_item.f){
                var _result = _item.f.apply(p,_args)||
                              _args[_args.length-4];
                _doMergeResult(_item.n,_result);
            }
            __scache[_item.n] = 2;
            console.log('do '+_item.n);
        };
    })();
    /*
     * æ£€æŸ¥ä¾èµ–è½½å…¥æƒ…å†µ
     * @return {Void}
     */
    var _doCheckLoading = function(){
        if (!__xqueue.length) return;
        for(var i=__xqueue.length-1,_item;i>=0;){
            _item = __xqueue[i];
            if (__scache[_item.n]!==2&&
               (!_isMapLoaded(_item.p)||
                !_isListLoaded(_item.h)||
                !_isListLoaded(_item.d))){
                i--; continue;
            }
            // for loaded
            __xqueue.splice(i,1);
            if (__scache[_item.n]!==2){
                _doExecFunction(_item);
            }
            i = __xqueue.length-1;
        }
        // check circular reference
        if (__xqueue.length>0&&_isFinishLoaded()){
            var _item = _doFindCircularRef()||__xqueue.pop();
            console.warn('try to unlock circular reference -> '+_item.n);
            _doExecFunction(_item);
            _doCheckLoading();
        }
    };
    /*
     * æ¸…ç†å‡½æ•°å®šä¹‰ç¼“å­˜æ ˆ
     * @return {Void}
     */
    var _doClearStack = function(){
        var _args = __stack.pop();
        while(!!_args){
            _doDefine.apply(p,_args);
            _args = __stack.pop();
        }
    };
    /*
     * æŸ¥æ‰¾å½“å‰æ‰§è¡Œçš„è„šæœ¬
     * @return {Node} å½“å‰æ‰§è¡Œè„šæœ¬
     */
    var _doFindScriptRunning = function(){
        var _list = document.getElementsByTagName('script');
        for(var i=_list.length-1,_script;i>=0;i--){
            _script = _list[i];
            if (_script.readyState=='interactive')
                return _script;
        }
    };
    /*
     * æ‰§è¡Œæ¨¡å—å®šä¹‰
     * @param  {String}   _uri      å½“å‰æ‰€åœ¨æ–‡ä»¶ï¼Œç¡®å®šæ–‡ä»¶ä¸­æ¨¡å—ä¸ä¼šè¢«å…¶ä»–æ–‡ä»¶ä¾èµ–æ—¶å¯ä»¥ä¸ç”¨ä¼ æ­¤å‚æ•°ï¼Œæ¯”å¦‚å…¥å£æ–‡ä»¶
     * @param  {Array}    _deps     æ¨¡å—ä¾èµ–çš„å…¶ä»–æ¨¡å—æ–‡ä»¶ï¼Œæ²¡æœ‰ä¾èµ–å…¶ä»–æ–‡ä»¶å¯ä¸ä¼ æ­¤å‚æ•°
     * @param  {Function} _callback æ¨¡å—å®šä¹‰å›žè°ƒã€å¿…é¡»ã€‘
     * @return {Void}
     */
    var _doDefine = (function(){
        var _seed = +new Date,
            _keys = ['d','h'];
        var _doComplete = function(_list,_base){
            if (!_list||!_list.length) return;
            for(var i=0,l=_list.length,_it;i<l;i++){
                _it = _list[i]||'';
                if(_it.indexOf('.')!=0) continue;
                _list[i] = _doFormatURI(_it,_base);
            }
        };
        return function(_uri,_deps,_callback){
            // check input
            var _args = _doFormatARG.apply(
                p,arguments
            );
            _uri = _args[0]||
                   _doFormatURI('./'+(_seed++)+'.js');
            _deps = _args[1];
            _callback = _args[2];
            // check module defined in file
            _uri = _doFormatURI(_uri);
            if (__scache[_uri]===2){
                return; // duplication
            }
            // for {platform}
            var _plts;
            if (!!_deps){
                _plts = _doMergePlatform(_deps);
            }
            // for NEJ.patch
            var _pths;
            if (!!_callback){
                _pths = _doMergePatched(_callback);
            }
            // complete relative uri
            _doComplete(_deps,_uri);
            __scache[_uri] = 1;
            // push to load queue
            var _xmap = {
                n:_uri,d:_deps,
                h:_pths,f:_callback
            };
            __xqueue.push(_xmap);
            // load dependence
            for(var i=0,l=_keys.length,_it,_list;i<l;i++){
                _it = _keys[i];
                _list = _xmap[_it];
                if (!!_list&&!!_list.length){
                    var _kmap = {};
                    for(var k=0,j=_list.length,_itt,_itm,_arr,_type;k<j;k++){
                        _itt = _list[k];
                        if (!_itt){
                            console.warn('empty dep uri for '+_uri);
                        }
                        // 0 - url
                        // 1 - load function
                        // 2 - resource type
                        _arr = _doParsePlugin(_itt);
                        _itm = _doFormatURI(_arr[0],_uri,_arr[2]);
                        _kmap[_itt] = _itm;
                        _list[k] = _itm;
                        // load resource
                        _arr[1](_itm);
                    }
                    if (_it==='h'&&!!_xmap.f){
                        _xmap.f.kmap = _kmap;
                    }
                }
            }
            if (!!_plts){
                var _pmap = {};
                for(var x in _plts){
                    _it = _doFormatURI(_plts[x],_uri);
                    _pmap[_doFormatURI(x,_uri)] = _it;
                    _doLoadScript(_it);
                }
                _xmap.p = _pmap;
            }
            // check state
            _doCheckLoading();
        };
    })();
    // exports
    /**
     * NEJåå­—ç©ºé—´
     * @namespace NEJ
     */
    p.NEJ = {};
    /**
     * æ¨¡å—å®šä¹‰ï¼Œå•ä¸ªæ–‡ä»¶åªå…è®¸å®šä¹‰ä¸€ä¸ªæ¨¡å—ï¼Œå³åªå…è®¸æ‰§è¡Œä¸€æ¬¡NEJ.defineï¼Œæ¨¡å—æ‰§è¡Œå‡½æ•°æ”¯æŒä¾èµ–åˆ—è¡¨æ³¨å…¥å’Œåå­—ç©ºé—´ä¸¤ç§æ–¹å¼
     * 
     * æ–‡ä»¶è·¯å¾„éµå¾ªä»¥ä¸‹è§„åˆ™
     *  
     *  * å®Œæ•´çš„æ–‡ä»¶è·¯å¾„ï¼Œå¦‚ http://a.b.com/patch/to/file.js
     *  * ä½¿ç”¨{}æ ‡è¯†é…ç½®å‚æ•°ï¼Œå¦‚{root}file.js
     *  * ç›´æŽ¥ä½¿ç”¨éž{}æ ‡è¯†é…ç½®å‚æ•°ï¼Œæ­¤æ—¶ä¸èƒ½åŠ .jsåŽç¼€ï¼Œç³»ç»Ÿè‡ªåŠ¨åŠ .jsåŽç¼€ï¼Œå¦‚ root/file
     *  * NEJåº“æ–‡ä»¶å¯ä»¥çœç•¥libæ ‡è¯†ï¼Œå¦‚base/elementï¼Œç­‰ä»·äºŽ lib/base/elementï¼Œç­‰ä»·äºŽ {lib}base/element.js
     *  * å…¶ä»–æ–‡æœ¬èµ„æºé‡‡ç”¨text!å‰ç¼€æ ‡è¯†ï¼Œå¦‚text!/path/to/file.cssï¼Œæ³¨æ„å¼€å‘æ—¶å¦‚æžœèµ„æºæ˜¯è·¨åŸŸçš„è¯·è®¾ç½®å¥½æµè§ˆå™¨XHRçš„è·¨åŸŸæ”¯æŒ
     *  * JSONèµ„æºé‡‡ç”¨json!å‰ç¼€æ ‡è¯†ï¼Œå¦‚json!/path/to/data.jsonï¼Œæ³¨æ„å¼€å‘æ—¶å¦‚æžœèµ„æºæ˜¯è·¨åŸŸçš„è¯·è®¾ç½®å¥½æµè§ˆå™¨XHRçš„è·¨åŸŸæ”¯æŒ
     *  * Regularæ¨¡æ¿èµ„æºé‡‡ç”¨regular!å‰ç¼€æ ‡è¯†ï¼Œå¦‚regular!/path/to/file.htmlï¼Œæ³¨æ„å¼€å‘æ—¶å¦‚æžœèµ„æºæ˜¯è·¨åŸŸçš„è¯·è®¾ç½®å¥½æµè§ˆå™¨XHRçš„è·¨åŸŸæ”¯æŒ
     *  * è·¯å¾„ä»¥ ./ æˆ–è€… ../ å¼€å§‹çš„ç›¸å¯¹è·¯å¾„åˆ™ç›¸å¯¹äºŽå½“å‰è„šæœ¬æ–‡ä»¶çš„è·¯å¾„ï¼Œå¦‚ ./util.js
     *
     * ```javascript
     * // ä¾èµ–base/globalå’Œbase/util
     * NEJ.define([
     *    'base/global',
     *    'base/util'
     * ],function(NEJ,u,p,o,f,r){
     *     // u - {lib}base/util.jsæ–‡ä»¶è¿”å›žçš„apié›†åˆ
     *     // p - å…è®¸å¤–ç•Œè°ƒç”¨çš„ç±»æˆ–è€…APIå‡å®šä¹‰åœ¨pç©ºé—´ä¸‹
     *     // o - æ³¨å…¥çš„ç©ºå¯¹è±¡ {}
     *     // f - æ³¨å…¥çš„ç©ºå‡½æ•° function(){return !1;}
     *     // r - æ³¨å…¥çš„ç©ºæ•°ç»„ []
     *
     *     // TODO something
     *
     *     // è¿”å›žå…è®¸å¤–ç•Œä½¿ç”¨çš„å¯¹è±¡
     *     return p;
     * });
     * ```
     *
     * ```javascript
     * // ä¸ä¾èµ–å…¶ä»–æ–‡ä»¶ï¼Œç­‰ä»·äºŽç›´æŽ¥æ‰§è¡Œ
     * NEJ.define(function(p,o,f,r){
     *     // TODO something
     *
     *     return p;
     * });
     * ```
     *
     * ```javascript
     * // ä»…ç”¨äºŽå¼•å…¥ä¾èµ–æ–‡ä»¶åˆ—è¡¨è€Œä¸æ‰§è¡Œä¸šåŠ¡é€»è¾‘
     * NEJ.define(['base/global']);
     * ```
     *
     * @method NEJ.define
     * @param  {String}   arg0 - å½“å‰æ–‡ä»¶è·¯å¾„æ ‡è¯†ï¼Œä¸ä¼ è‡ªåŠ¨è§£æžï¼Œå»ºè®®ä¸ä¼ æ­¤å‚æ•°
     * @param  {Array}    arg1 - æ¨¡å—ä¾èµ–çš„å…¶ä»–æ¨¡å—æ–‡ä»¶ï¼Œæ²¡æœ‰ä¾èµ–å…¶ä»–æ–‡ä»¶å¯ä¸ä¼ æ­¤å‚æ•°
     * @param  {Function} arg2 - æ¨¡å—å®šä¹‰å›žè°ƒï¼Œä¾èµ–åˆ—è¡¨ä¸­æ–‡ä»¶è¿”å›žçš„æ‰§è¡Œç»“æžœä¼šä¾æ¬¡æ³¨å…¥æ­¤å›žè°ƒä¸­ï¼Œå›žè°ƒè¿”å›žçš„ç»“æžœå¯è¢«å…¶ä»–æ–‡ä»¶ä¾èµ–æ—¶æ³¨å…¥
     * @return {Void}
     */
    NEJ.define = function(_uri,_deps,_callback){
        // has uri
        if (_isTypeOf(_uri,'String'))
            return _doDefine.apply(p,arguments);
        // without uri
        var _args = [].slice.call(arguments,0),
            _script = _doFindScriptRunning();
        // for ie check running script
        if (!!_script){
            var _src = _script.src;
            if (!!_src)
                _args.unshift(_doFormatURI(_src));
            return _doDefine.apply(p,_args);
        }
        // for other
        __stack.push(_args);
        _doAddAllListener();
    };
    /**
     * æ ¹æ®æ¡ä»¶åˆ¤æ–­æ˜¯å¦åœ¨å½“å‰å¹³å°æ‰§è¡Œï¼Œ
     * å¹³å°æ”¯æŒTR|WR|GRï¼Œæ²¡æœ‰æ¯”è¾ƒæ“ä½œç¬¦è¡¨ç¤ºæ”¯æŒå½“å‰å†…æ ¸æ‰€æœ‰releaseç‰ˆæœ¬
     *
     *  | æ ‡è¯†ç¬¦ | è¯´æ˜Ž |
     *  | :--   | :-- |
     *  | T     | Tridentå¼•æ“Žï¼Œå¦‚ie |
     *  | W     | Webkitå¼•æ“Žï¼Œå¦‚chrome |
     *  | G     | Geckoå¼•æ“Žï¼Œå¦‚firefox |
     *
     * å¹³å°å†…ç½®çš„Tridentå¼•æ“Žç‰ˆæœ¬å¯¹åº”çš„IEç‰ˆæœ¬å…³ç³»ï¼š
     *
     *  | Tridentç‰ˆæœ¬ | IEç‰ˆæœ¬ |
     *  | :-- | :-- |
     *  | 2.0 | 6   |
     *  | 3.0 | 7   |
     *  | 4.0 | 8   |
     *  | 5.0 | 9   |
     *  | 6.0 | 10  |
     *  | 7.0 | 11  |
     *
     * patchæ–‡ä»¶å¿…é¡»ç¬¦åˆä»¥ä¸‹è§„åˆ™ï¼š
     * * åªå…è®¸æ‰§è¡Œè‹¥å¹²NEJ.patch
     * * NEJ.patchä¸­åªå…è®¸ä¿®æ”¹hack.jsæ³¨å…¥çš„å¯¹è±¡é‡Œçš„API
     * * å®šä¹‰å‡½æ•°å¿…é¡»è¿”å›žhack.jsæ³¨å…¥çš„å¯¹è±¡
     *
     * ```javascript
     * NEJ.define([
     *     './hack.js'
     * ],function(h,p,o,f,r){
     *     // é’ˆå¯¹tridentå¹³å°çš„å¤„ç†é€»è¾‘
     *     NEJ.patch('TR',function(){
     *         // TODO
     *         console.log('from inline ie');
     *         h.api = function(){
     *             // TODO
     *         };
     *     });
     *
     *     // é’ˆå¯¹webkitå¹³å°çš„å¤„ç†é€»è¾‘
     *     NEJ.patch('WR',['./hack.chrome.js'],function(wk){
     *         // TODO
     *         console.log('from inline chrome');
     *     });
     *
     *     // é’ˆå¯¹geckoå¹³å°çš„å¤„ç†é€»è¾‘
     *     NEJ.patch('GR',['./hack.firefox.js'],function(gk){
     *         // TODO
     *         console.log('from inline firefox');
     *     });
     *
     *     // é’ˆå¯¹IE6å¹³å°çš„å¤„ç†é€»è¾‘
     *     NEJ.patch('TR==2.0',['./hack.ie6.js']);
     *
     *     // é’ˆå¯¹IE7-IE9çš„å¤„ç†é€»è¾‘
     *     NEJ.patch('3.0<=TR<=5.0',function(){
     *         // TODO
     *         console.log('from inline ie7-ie9');
     *     });
     *
     *     // å¿…é¡»è¿”å›žhack.jsæ³¨å…¥çš„å¯¹è±¡
     *     return h;
     * });
     * ```
     *
     * @method NEJ.patch
     * @param  {String}   arg0 - å¹³å°è¯†åˆ«æ¡ä»¶ï¼Œå¦‚ï¼š6<=TR<=9
     * @param  {Array}    arg1 - ä¾èµ–æ–‡ä»¶åˆ—è¡¨
     * @param  {Function} arg2 - æ‰§è¡Œå‡½æ•°
     * @return {Void}
     */
    NEJ.patch = function(_exp,_deps,_callback){
        var _args = _doFormatARG.apply(
            null,arguments
        );
        if (!_args[0]) return;
        // check platform
        var _kernel = __platform._$KERNEL,
            _result = _doParsePatchExp(_args[0]);
        if (!!_result&&!!_args[2]&&
            _result.isEngOK(_kernel[_result.pkey])&&
            _result.isVerOK(_kernel[_result.vkey])){
            var _argc = [],
                _deps = _args[1];
            if (!!_deps){
                var _xmap = arguments.callee.caller.kmap||{};
                for(var i=0,l=_deps.length;i<l;i++){
                    _argc.push(__rcache[_xmap[_deps[i]]]||{});
                }
            }
            _args[2].apply(p,_argc);
        }
    };
    /**
     * è½½å…¥ä¾èµ–é…ç½®ï¼Œå¯¹äºŽè€é¡¹ç›®æˆ–è€…ä½¿ç”¨ç¬¬ä¸‰æ–¹æ¡†æž¶çš„é¡¹ç›®ï¼Œå¯ä»¥ä½¿ç”¨æ­¤æŽ¥å£é…ç½®
     *
     * é¡¹ç›®æŸä¸ªé¡µé¢åŠ è½½çš„è„šæœ¬åˆ—è¡¨
     *
     * ```html
     * <script src="./a.js"></script>
     * <script src="./b.js"></script>
     * <script src="./c.js"></script>
     * <script src="./d.js"></script>
     * <script src="./e.js"></script>
     * <script src="./f.js"></script>
     * ```
     *
     * æ ¹æ®è„šæœ¬è§„åˆ™æå–æ–‡ä»¶çš„ä¾èµ–å…³ç³»ï¼Œæ²¡æœ‰ä¾èµ–å…¶ä»–æ–‡ä»¶å¯ä¸é…ç½®ï¼Œå‡è®¾é¡µé¢å…¥å£æ–‡ä»¶ä¸ºf.js
     *
     * ```javascript
     * var deps = {
     *     '{pro}f.js':['{pro}d.js'],
     *     '{pro}e.js':['{pro}a.js','{pro}b.js','{pro}c.js'],
     *     '{pro}c.js':['{pro}b.js'],
     *     '{pro}b.js':['{pro}a.js']
     * };
     * ```
     *
     * é€šè¿‡NEJ.depsé…ç½®ä¾èµ–å…³ç³»ï¼Œå‡è®¾ä»¥ä¸‹é…ç½®æ–‡ä»¶çš„è·¯å¾„ä¸º./deps.js
     *
     * ```javascript
     * NEJ.deps(deps,['{pro}f.js']);
     * ```
     *
     * ä¿®æ”¹é¡µé¢ä½¿ç”¨æ–‡ä»¶ä¾èµ–ç®¡ç†ï¼Œä½¿ç”¨då‚æ•°é…ç½®ä¾èµ–æ–‡ä»¶åœ°å€
     *
     * ```html
     *   <script src="http://nej.netease.com/nej/src/define.js?d=./deps.js&pro=./"></script>
     *   <script src="./f.js"></script>
     * ```
     *
     * ä¹‹åŽé¡¹ç›®åªéœ€è¦ç»´æŠ¤deps.jsä¸­çš„ä¾èµ–é…ç½®ä¿¡æ¯å³å¯
     *
     * è¯´æ˜Žï¼šå¼€å‘é˜¶æ®µdeps.jsä¸­é…ç½®çš„æ–‡ä»¶å‡ä¼šè¢«è½½å…¥é¡µé¢ä¸­ï¼Œå‘å¸ƒä¸Šçº¿æ—¶ä»…æå–é¡µé¢ä½¿ç”¨åˆ°çš„è„šæœ¬ï¼Œæ¯”å¦‚ä¸Šä¾‹ä¸­é¡µé¢åªç”¨åˆ°f.jsï¼Œé€šè¿‡é…ç½®æ–‡ä»¶å¯ä»¥å‘çŽ°f.jsåªä¾èµ–äº†d.jsï¼Œå› æ­¤è¿™ä¸ªé¡µé¢æœ€ç»ˆå‘å¸ƒæ—¶åªä¼šå¯¼å‡ºd.jså’Œf.js
     *
     * @method NEJ.deps
     * @param  {Object} arg0 - ä¾èµ–æ˜ å°„è¡¨ï¼Œå¦‚'{pro}a.js':['{pro}b.js','{pro}c.js']
     * @param  {Array}  arg1 - å…¥å£å±è”½æ–‡ä»¶åˆ—è¡¨ï¼Œé¡µé¢è½½å…¥ä¾èµ–é…ç½®æ–‡ä»¶ä¸­çš„æ–‡ä»¶æ—¶ä¸è½½å…¥æ­¤åˆ—è¡¨ä¸­çš„æ–‡ä»¶ï¼Œå¤šä¸ºé¡µé¢å…¥å£æ–‡ä»¶
     * @return {Void}
     */
    NEJ.deps = function(_map,_entry){
        var _list = _doSerializeDepList(_map);
        if (!_list||!_list.length) return;
        // ignore entry list
        var _map = {};
        if (!!_entry&&_entry.length>0){
            for(var i=0,l=_entry.length;i<l;i++){
                _map[_doFormatURI(_entry[i])] = !0;
            }
        }
        for(var i=_list.length-1;i>=0;i--){
            if (!!_map[_list[i]]){
                _list.splice(i,1);
            }
        }
        // load script
        var _arr = [];
        for(var i=0,l=_list.length,_it;i<l;i++){
            _it = _list[i];
            _arr.push('<script src="'+_it+'"></scr'+'ipt>');
            __scache[_it] = 2;
        }
        document.writeln(_arr.join(''));
    };
    /**
     * æ˜¯å¦å…¼å®¹æ¨¡å¼ï¼Œå…¼å®¹æ¨¡å¼ä¸‹æ”¯æŒç”¨å…¨å±€åå­—ç©ºé—´ä½¿ç”¨APIå’ŒæŽ§ä»¶
     *
     * ```javascript
     * if (CMPT){
     *     // TODO something
     *     // æ­¤ä¸­çš„ä»£ç å—åœ¨æ‰“åŒ…é…ç½®æ–‡ä»¶ä¸­å°†OBF_COMPATIBLEè®¾ç½®ä¸ºfalseæƒ…å†µä¸‹æ‰“åŒ…è¾“å‡ºæ—¶å°†è¢«å¿½ç•¥
     * }
     * ```
     *
     * @name external:window.CMPT
     * @constant {Boolean}
     */
    p.CMPT = !0;
    /**
     * æ˜¯å¦è°ƒè¯•æ¨¡å¼ï¼Œæ‰“åŒ…æ—¶è°ƒè¯•æ¨¡å¼ä¸‹çš„ä»£ç å°†è¢«è¿‡æ»¤
     *
     * ```javascript
     * if (DEBUG){
     *     // TODO something
     *     // æ­¤ä¸­çš„ä»£ç å—åœ¨æ‰“åŒ…å‘å¸ƒåŽè¢«è¿‡æ»¤ï¼Œä¸ä¼šè¾“å‡ºåˆ°ç»“æžœä¸­
     * }
     * ```
     *
     * @name external:window.DEBUG
     * @constant {Boolean}
     */
    p.DEBUG = !0;
    // init
    _doInit();
})(document,window);