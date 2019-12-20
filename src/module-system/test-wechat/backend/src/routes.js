const version = require('./controller/version.js');
const event = require('./controller/event.js');

module.exports = app => {
  const routes = [
    // version
    { method: 'post', path: 'version/update', controller: version, middlewares: 'inner' },
    { method: 'post', path: 'version/init', controller: version, middlewares: 'inner' },
    { method: 'post', path: 'version/test', controller: version, middlewares: 'test' },
    // event/wechatMessage
    { method: 'post', path: 'event/wechatMessage', controller: event, middlewares: 'inner', meta: { auth: { enable: false } } },

  ];
  return routes;
};
