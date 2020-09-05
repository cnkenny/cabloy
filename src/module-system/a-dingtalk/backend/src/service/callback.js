const dingtalkUtils = require('../common/dingtalkUtils.js');

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Callback extends app.Service {

    async index({ message }) {
      // event: check_url
      if (message.EventType === 'check_url') {
        // just return
        return;
      } else if (message.EventType.indexOf('user_') === 0 || message.EventType.indexOf('org_dept_') === 0) {
        // user events or org events
        await this.contacts({ message });
      }
      // raise event
      await this.ctx.bean.event.invoke({
        module: moduleInfo.relativeName,
        name: 'dingtalkCallback',
        data: { message },
      });
    }

    async registerList() {
      // config
      const config = this.ctx.config.account.dingtalk.apps.selfBuilt.businessCallback;
      const host = config.host;
      const token = config.token;
      const encodingAESKey = config.encodingAESKey;
      const callbackList = config.list;
      const callbackUrl = this.ctx.bean.base.getAbsoluteUrl('/api/a/dingtalk/callback/index');
      // check if valid
      if (this.ctx.bean.base.host !== host || !token || !encodingAESKey || !callbackList) return;
      // check status
      const res = await this._tryGetList();
      if (!res) {
        // register
        await this.ctx.bean.dingtalk.app.selfBuilt.callback.register_call_back({
          call_back_tag: callbackList,
          token,
          aes_key: encodingAESKey,
          url: callbackUrl,
        });
      } else {
        // update
        const call_back_tag_setRemote = new Set(res.call_back_tag);
        const call_back_tag_setConfig = new Set(callbackList);
        const diff = dingtalkUtils.symmetricDifference(call_back_tag_setRemote, call_back_tag_setConfig);
        if (diff.size === 0) {
          // do nothing
        } else {
          // difference
          await this.ctx.bean.dingtalk.app.selfBuilt.callback.update_call_back({
            call_back_tag: callbackList,
            token,
            aes_key: encodingAESKey,
            url: callbackUrl,
          });
        }
      }
    }

    async _tryGetList() {
      try {
        return await this.ctx.bean.dingtalk.app.selfBuilt.callback.get_call_back();
      } catch (err) {
        if (err.code === 71007) return null;
        throw err;
      }
    }

    async contacts({ message }) {
      // queue
      this.ctx.app.meta.queue.push({
        locale: this.ctx.locale,
        subdomain: this.ctx.subdomain,
        module: moduleInfo.relativeName,
        queueName: 'contacts',
        data: {
          queueAction: 'changeContact',
          message,
        },
      });
      // ok
      return null;
    }

  }

  return Callback;
};
