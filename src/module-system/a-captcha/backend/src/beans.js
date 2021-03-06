const middlewareCaptchaVerify = require('./bean/middleware.captchaVerify.js');
const beanCaptcha = require('./bean/bean.captcha.js');

module.exports = app => {
  const beans = {
    // middleware
    'middleware.captchaVerify': {
      mode: 'ctx',
      bean: middlewareCaptchaVerify,
    },
    // global
    captcha: {
      mode: 'ctx',
      bean: beanCaptcha,
      global: true,
    },
  };
  return beans;
};
