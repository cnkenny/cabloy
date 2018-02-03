import fns from '../base/fns.js';
import App from './app.vue';
import util from '../base/util.js';

export default function(Vue, options, cb) {
  // patch router
  require('./router.js').default(Vue);
  // load sync modules
  Vue.prototype.$meta.module.requireAll();
  // load module layout
  Vue.prototype.$meta.module.use(options.meta.layout, module => {
    return cb(prepareParameters(module));
  });

  // prepare parameters
  function prepareParameters(moduleLayout) {
    // layout
    App.components.layout = moduleLayout.options.components.layout;
    // f7 parameters
    const f7Parameters = {
      el: '#app',
      render: c => c('app'),
      store: Vue.prototype.$meta.store,
      routes: [],
      framework7: {
        theme: 'md',
      },
      methods: {
        onF7Ready() {
          // load waiting modules
          Vue.prototype.$meta.module.loadWaitings();
          // remove app loading
          util.removeAppLoading();
        },
      },
      components: {
        App,
      },
    };

    const parametersNew = {};
    Vue.prototype.$utils.extend(parametersNew, options.parameters);
    Vue.prototype.$utils.extend(parametersNew, f7Parameters);

    if (options.parameters.methods && options.parameters.methods.onF7Ready) {
      parametersNew.methods.onF7Ready = fns([ options.parameters.methods.onF7Ready, f7Parameters.methods.onF7Ready ]);
    }

    return parametersNew;
  }

}

