const axios = require('axios');
// App
function App(c, name) {
  this._sync = null;
  this.config = c;
  // 连接实例
  this.sync = function () {
    if (!this._sync) {
      this._sync = new Sync(c.username, c.password, c.ip, c.token);
    }
    return this._sync;
  }
}

/**
 * Sync 连接实例
 * 管理连接、节点实例
 */
function Sync(username, password, ip, token) {
  if (!username || !password || !ip || !token) {
    console.error('缺少连接参数');
  } else {
    this.queryList = {

    };
    this.callbackList = {
      /*
      数据结构
      nodePath: {
        'child_add': {
          callback: function() { }, // 用户定义
          once: false
        },
        'child_remove': { },
        'child_change': { },
        'value': { }
      }
      */
    };
    this.userdata = null;
    // 连接参数
    this.username = username;
    this.password = password;
    this.ip = ip;
    this.token = token;
    // 连接开启之前的任务
    this.onLogin = [];
    // 节点实例
    this.refList = {};
    // websocket实例
    this.ws = null;
    // 心跳定时器
    hbTimer: 0;
    // 手动断开
    this.forceClose = false;
    return this.goOnline();
  }
}
// 创建节点实例
Sync.prototype.ref = function (path) {
  if (!path) {
    console.error('没有指定节点');
  } else {
    path = '/' + path.replace(/^\/|\/$/g, '');
    return this.refList[path] = new Ref(path, this);
  }
}
/**
 * 消息回调
 * @param {Object} msg 收到的推送消息
 */
Sync.prototype.call = function (msg) {
  var path = JSON.parse(msg)[path];
  var ref = this.refList[path];
  // var 
}
// 手动断开
Sync.prototype.goOffline = function () {
  if (this.ws) {
    this.forceClose = true;
    this.ws.close();
  }
}
// 连接
Sync.prototype.goOnline = function () {
  var t = this;
  t.ws = null;
  var ws = new WebSocket('wss://' + t.ip + '?username=' + t.username + '&password=' + t.password);
  ws.addEventListener('open', function (e) {
    clearInterval(t.hbTimer);
    t.hbCheck();
    // 连接后
    for (var i in t.callbackList) {
      var ref = t.refList[i];
      var events = t.callbackList[i];
      if (events) {
        for (var j in events) {
          ref.on(j, events[j].callback);
        }
      }
    }
    // queryList
    for (var i in t.queryList) {
      var q = t.queryList[i];
      if (q) {
        delete(t.queryList[i]);
        q.query.get(q.callback, q.getCount);
      }
    }
  });
  ws.addEventListener('close', function (e) {
    console.log('close');
    if (t.forceClose) {
      t.forceClose = false;
    } else {
      setTimeout(() => {
        t.goOnline();
      }, 1000);
    }
  });
  ws.addEventListener('message', function (e) {
    // 事件类型：登录成功；订阅成功；收到推送
    var d = JSON.parse(e.data);
    if (d.code === 10007) {
      // 登录成功
      t.userdata = d.data.user;
      // 异步任务
      for (var i = 0; i < t.onLogin.length; i++) {
        if (typeof t.onLogin[i] === 'function') {
          t.onLogin[i]();
        }
      }
      t.onLogin.length = 0;
    } else if (d.code === 1100 || d.code === 1104) {
      if (d.data.success) {
        // console.log(d.msg + ': ' + d.data.nodePath);
      } else {
        console.error(d.msg);
      }
    } else if (1101 <= d.code <= 1103) {
      var eventMap = {
        1101: 'child_change',
        1102: 'child_remove',
        1103: 'child_add'
      };
      var e = eventMap[d.code];
      if (d.data.success) {
        for (var path in t.callbackList) {
          if (d.data.nodePath.indexOf(path) != -1) {
            if (t.callbackList[path]) {
              // 尝试解析数据
              try {
                d.data.nodeContent = JSON.parse(d.data.nodeContent);
              } catch (error) { }
              if (t.callbackList[path][e] && typeof t.callbackList[path][e].callback === 'function') {
                t.callbackList[path][e].callback(d.data);
                if (t.callbackList[path][e].once) {
                  delete (t.callbackList[path][e]);
                }
              }
              if (t.callbackList[path]['value'] && typeof t.callbackList[path]['value'].callback == 'function') {
                t.callbackList[path]['value'].callback(d.data);
                if ( t.callbackList[path] && t.callbackList[path]['value'] && t.callbackList[path]['value'].once) {
                  delete (t.callbackList[path]['value']);
                }
              }
            }
          }
        }
      }
    } else {
      console.error('未知的消息');
    }
  });
  this.ws = ws;
  return this;
}

// 心跳检测 todo
Sync.prototype.hbCheck = function() {
  var t = this;
  t.hbTimer = setInterval(() => {
    if (t.ws.readyState === WebSocket.OPEN) {
      t.ws.send(JSON.stringify({
        cmd: '13',
        hbbyte: '-127'
      }))
    } else {
      clearInterval(t.hbTimer);
    }
  }, 10000);
}

// 查询类 Query
function Query(path, sync, opt) {
  // 筛选条件
  var defaultOpt = {
    orderBy: '',
    equalTo: '',
    startAt: '',
    endAt: '',
    limitToFirst: '',
    limitToLast: ''
  };
  this.opt = Object.assign(defaultOpt, opt)
  // websocket 实例
  this.sync = sync;
  // 节点路径
  this.path = path;
}
Query.prototype.setFilter = function (k, v) {
  // 设置筛选条件
  var opt = JSON.parse(JSON.stringify(this.opt));
  opt[k] = v;
  return new Query(this.path, this.sync, opt);
}
Query.prototype.ref = function (path) {
  path = '/' + this.path.replace(/^\/|\/$/g, '') + '/' + path;
  return this.sync.ref(path);
}
// 监听并获取一次数据
Query.prototype.once = function (eventType, callback) {
  var ref = this.on(eventType, callback);
  if (ref) {
    this.sync.callbackList[this.path][eventType]['once'] = true;
  }
  return this;
}

// 取消监听节点
Query.prototype.off = function (eventType, callback) {
  // 删除事件回调
  var path = this.sync.callbackList[this.path];
  if (!path) return;
  if (!path[eventType]) return;
  delete (path[eventType]);
  var events = Object.values(path);
  if (events.length === 0) {
    var callbackList = this.sync.callbackList;
    delete (callbackList[this.path]);
  }
  // 回调为空，发送到服务器取消订阅
  if (Object.keys(path).length === 0) {
    // 发送订阅请求
    var _this = this;
    var task = function () {
      var d = {
        user: {
          id: _this.sync.userdata.id,
          groups: [{ "group_id": _this.path }]
        },
        cmd: 34,
        path: 'yuanda/node' + _this.path
      };
      _this.sync.ws.send(JSON.stringify(d));
    }
    if (this.sync.ws.readyState === WebSocket.OPEN) {
      task();
    } else {
      this.sync.onLogin.push(task);
    }
    return _this;
  }
}

// 监听指定节点的数据
Query.prototype.on = function (eventType, callback) {
  var t = this;
  // 设置事件回调
  var types = ['child_add', 'child_change', 'child_remove', 'value'];
  if (types.includes(eventType)) {
    t.sync.callbackList[t.path] = t.sync.callbackList[t.path] || {};
    t.sync.callbackList[t.path][eventType] = {
      once: false,
      callback: callback
    };
  } else {
    console.error('未知的事件类型');
    return false;
  }
  // 发送订阅请求
  var task = function () {
    var d = {
      cmd: 7,
      path: 'yuanda/node' + t.path
    };
    var g = { groups: [{ "group_id": t.path }] };
    d.user = Object.assign(t.sync.userdata, g);
    t.sync.ws.send(JSON.stringify(d));
  }
  if (this.sync.ws.readyState === WebSocket.OPEN && this.sync.userdata !== null) {
    task();
  } else {
    this.sync.onLogin.push(task);
  }
  return t;
}
// 获取节点树
Query.prototype.getTree = function (callback) {
  var t = this;
  axios({
    transformRequest: [function (data, headers) { return data; }],
    type: 'json',
    url: 'https://' + t.sync.ip + '/node/getTree?path=' + t.path + '&token=' + t.sync.token,
    method: 'get'
  }).then(function (d) {
    if (typeof callback == 'function') {
      d = d.data;
      if (d && d.nodeContent) {
        d.nodeContent = JSON.parse(d.nodeContent);
      }
      callback(d);
    }
  });
}
// 获取子节点个数
Query.prototype.childCount = function (callback) {
  this.get(callback, true);
}
/**
 * 获取节点数据
 * @param callback [Function] ajax 回调
 * @param getCount [Boolean] 仅获取节点个数
 */
Query.prototype.get = function (callback, getCount) {
  var t = this;
  var d = {
    api: '/get',
    nodePath: t.path
  };
  if (getCount) {
    d.count = true;
  }
  if (this.opt.orderBy.length != 0) {
    d.orderBy = this.opt.orderBy;
  }
  // 值的范围
  if (this.opt.equalTo.toString()) {
    d.equalTo = this.opt.equalTo;
  } else {
    if (this.opt.startAt.toString()) {
      d.startAt = this.opt.startAt;
    }
    if (this.opt.endAt.toString()) {
      d.endAt = this.opt.endAt;
    }
  }
  // 条数限制
  if (this.opt.limitToFirst.length != 0) {
    d.limitToFirst = this.opt.limitToFirst;
  } else if (this.opt.limitToLast.length != 0) {
    d.limitToLast = this.opt.limitToLast;
  }
  // 只取子节点key
  if (this.opt.firstLevel) {
    d.firstLevel = true;
  }
  var xhr = axios.create();
  return xhr({
    transformRequest: [function (data, headers) { return data; }],
    type: 'json',
    url: 'https://' + t.sync.ip + '/node/sdkapi?token=' + t.sync.token,
    method: 'post',
    data: JSON.stringify(d)
  }).then(function (d) {
    if (typeof callback == 'function') {
      d = d.data;
      if (d.nodeContent) {
        d.nodeContent = JSON.parse(d.nodeContent);
      }
      callback(d);
    }  
  }).catch(function(error) {
    if (error.message.toLowerCase() === 'network error') {
      // ws 重新成功连接后再尝试请求
      var mark = new Date().getTime() + t.path;
      t.sync.queryList[mark] = {
        query: t,
        callback: callback,
        getCount: getCount
      };
    }
  });
}
Query.prototype.orderByKey = function (orderField) {
  orderField = orderField ? '$child-' + orderField : '$key';
  return this.setFilter('orderBy', orderField);
}
Query.prototype.equalTo = function (equal) {
  return this.setFilter('equalTo', equal);
}
Query.prototype.endAt = function (end) {
  return this.setFilter('endAt', end);
}
Query.prototype.startAt = function (start) {
  return this.setFilter('startAt', start);
}
Query.prototype.limitToFirst = function (first) {
  return this.setFilter('limitToFirst', first);
}
Query.prototype.limitToLast = function (last) {
  return this.setFilter('limitToLast', last);
}
Query.prototype.firstLevel = function () {
  return this.setFilter('firstLevel', true);
}
// 节点实例
function Ref(path, sync) {
  // 覆盖父类的属性
  Query.call(this, path, sync);
  // 删除节点
  this.remove = function (callback) {
    var t = this;
    axios({
      data: JSON.stringify({
        api: '/delete',
        nodePath: t.path
      }),
      transformRequest: [function (data, headers) { return data; }],
      url: 'https://' + t.sync.ip + '/node/sdkapi?token=' + t.sync.token,
      method: 'post',
      type: 'json',
    }).then(function (d) {
      if (typeof callback == 'function') {
        d = d.data;
        if (d.nodeContent) {
          d.nodeContent = JSON.parse(d.nodeContent);
        }
        callback(d);
      }
    })
  }
  // 修改节点数据
  this.set = function (nodeData, callback) {
    var t = this;
    axios({
      type: 'json',
      url: 'https://' + t.sync.ip + '/node/sdkapi?token=' + t.sync.token,
      transformRequest: [function (data, headers) { return data; }],
      method: 'post',
      data: JSON.stringify({
        api: '/update',
        nodePath: t.path,
        nodeContent: nodeData
      })
    }).then(function (d) {
      if (typeof callback == 'function') {
        if (d.nodeContent) {
          d.nodeContent = JSON.parse(d.nodeContent);
        }
        callback(d);
      }
    })
  }
  // 设置节点数据
  this.add = function (nodeData, callback) {
    if (!nodeData) {
      console.error('节点数据为空！');
      return;
    }
    var t = this;
    axios({
      type: 'json',
      url: 'https://' + t.sync.ip + '/node/sdkapi?token=' + t.sync.token,
      transformRequest: [function (data, headers) { return data; }],
      method: 'post',
      data: JSON.stringify({
        api: '/add',
        nodePath: t.path,
        nodeContent: nodeData
      })
    }).then(function (d) {
      if (typeof callback == 'function') {
        d = d.data;
        if (d.nodeContent) {
          d.nodeContent = JSON.parse(d.nodeContent);
        }
        callback(d);
      }
    })
  };
}
// 继承 Query，能够直接调用 Query 的方法
Ref.prototype = new Query();
Ref.prototype.constructor = Ref;

// App 列表
var apps = {};
var ydCloud = {
  /**
   * 初始化一个 app 实例
   * @param {Object} config 配置项对象
   * @param {String} appName 实例名称
   * @return {Object} apps App实例
   */
  initializeApp: function (config, appName) {
    appName = appName || new Date().getTime();
    apps[appName] = new App(config, appName);
    return apps[appName];
  }
}
export default ydCloud;