<template>
  <eb-link :class="buttonClass" :iconMaterial="isFullscreen?'fullscreen_exit':'fullscreen'" :onPerform="onPerform"></eb-link>
</template>
<script>
import screenfull from 'screenfull';

// export
export default {
  installFactory,
};

// installFactory
function installFactory(_Vue) {
  const Vue = _Vue;
  const ebLayoutButtonBase = Vue.prototype.$meta.module.get('a-layoutpc').options.mixins.ebLayoutButtonBase;
  return {
    mixins: [ ebLayoutButtonBase ],
    data() {
      return {
        isFullscreen: false,
      };
    },
    created() {
      if (!screenfull.isEnabled) {
        this.button.hide();
      } else {
        screenfull.on('change', () => {
          this.isFullscreen = screenfull.isFullscreen;
        });
      }
    },
    methods: {
      onPerform() {
        screenfull.toggle();
      },
    },
  };
}

</script>
