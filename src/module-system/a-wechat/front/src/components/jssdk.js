let _wxInstance = null;

export default {
  meta: {
    global: false,
  },
  methods: {
    onAction({ ctx, action, item }) {
      if (action.name === 'config') return this._createConfig({ ctx, item });
    },
    _createConfig(/* { ctx, item }*/) {
      if (!this.$device.wechat) return null;
      if (_wxInstance) return { wx: _wxInstance };
      return new Promise((resolve, reject) => {
        // load jweixin-1.4.0.js
        this.$meta.util.loadScript(this.$config.jssdk.url.jweixin, () => {
          this.$api.post('jssdk/jsconfig', { url: location.href.split('#')[0] }).then(params => {
            window.wx.config(params);
            window.wx.error(e => {
              reject(e);
            });
            window.wx.ready(() => {
              _wxInstance = window.wx;
              resolve({ wx: window.wx });
            });
          });
        });
      });
    },
  },
};