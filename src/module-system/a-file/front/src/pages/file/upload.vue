<template>
  <eb-page>
    <eb-navbar :title="title" eb-back-link="Back"></eb-navbar>
    <eb-box @size="onSize" toolbar @dragover.native="onFileDragover" @dragenter.native="onFileDragenter" @dragleave.native="onFileDragleave" @drop.native="onFileDrop">
      <img ref="image" class="image">
    </eb-box>
    <input ref="file" type="file" :accept="accept" @change="onFileChange" style="display: none;" />
    <div class="fileName" @dragover="onFileDragover" @dragenter="onFileDragenter" @dragleave="onFileDragleave" @drop="onFileDrop">{{fileName || $text('UploadFileDragTip')}}</div>
    <f7-toolbar bottom-md>
      <f7-button @click="onClickSelect">{{selectText}}</f7-button>
      <f7-button v-if="cropped" @click="onClickClearCrop">{{$text('Clear Crop')}}</f7-button>
      <eb-button v-if="fileBlob" active :onPerform="onPerformUpload">{{$text('Upload')}}</eb-button>
    </f7-toolbar>
  </eb-page>
</template>
<script>
import Vue from 'vue';
import Cropper from 'cropperjs';
const ebPageContext = Vue.prototype.$meta.module.get('a-components').options.mixins.ebPageContext;
export default {
  mixins: [ ebPageContext ],
  data() {
    return {
      cropped: false,
      fileName: null,
      fileBlob: null,
      fileNameDragging: false,
    };
  },
  computed: {
    mode() {
      return this.contextParams && this.contextParams.mode || 2;
    },
    atomId() {
      return this.contextParams && this.contextParams.atomId || 0;
    },
    attachment() {
      return this.contextParams && this.contextParams.attachment || 0;
    },
    flag() {
      return this.contextParams && this.contextParams.flag || '';
    },
    title() {
      if (this.mode === 1) return this.$text('Upload Image');
      else if (this.mode === 2) return this.$text('Upload File');
      else if (this.mode === 3) return this.$text('Upload Audio');
      return 'Not Support';
    },
    selectText() {
      if (this.mode === 1) return this.$text('Select Image');
      else if (this.mode === 2) return this.$text('Select File');
      else if (this.mode === 3) return this.$text('Select Audio');
      return 'Not Support';
    },
    accept() {
      const custom = this.contextParams && this.contextParams.accept;
      if (this.mode === 1) return custom || 'image/*';
      else if (this.mode === 2) return custom || '';
      else if (this.mode === 3) return custom || 'audio/*';
      return 'Not Support';
    },
  },
  mounted() {},
  methods: {
    createCropper() {
      if (this.mode === 1) {
        this._cropper = new Cropper(this.$refs.image, {
          viewMode: 2,
          checkOrientation: false,
          autoCrop: false,
          movable: false,
          rotatable: false,
          scalable: false,
          zoomable: false,
          toggleDragModeOnDblclick: false,
          crop: () => {
            this.cropped = true;
          },
        });
      }
    },
    onSize() {
      this.createCropper();
    },
    onClickSelect() {
      this.$refs.file.click();
    },
    onFileChange(event) {
      this.__setFile(event.target.files[0]);
    },
    __checkFileType(file) {
      const type = file.type;
      if (this.mode === 1 && type.indexOf('image/') !== 0) return false;
      if (this.mode === 3 && type.indexOf('audio/') !== 0) return false;
      return true;
    },
    __setFile(file) {
      if (!file) return;
      // check
      if (!this.__checkFileType(file)) {
        this.$view.toast.show({ text: this.$text('InvalidFileFormat') });
        return;
      }
      // set
      this.fileBlob = file;
      this.fileName = file.name;
      event.target.value = '';
      if (this.mode === 1) {
        const reader = new window.FileReader();
        reader.onload = () => {
          this._cropper.reset().replace(reader.result);
        };
        reader.readAsDataURL(this.fileBlob);
      }
    },
    onFileDragover(event) {
      event.preventDefault();
      event.stopPropagation();
    },
    onFileDragenter(event) {
      event.preventDefault();
      event.stopPropagation();
    },
    onFileDragleave(event) {
      event.preventDefault();
      event.stopPropagation();
    },
    onFileDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      this.__setFile(event.dataTransfer.files[0]);
    },
    onClickClearCrop() {
      this._cropper.clear();
      this.cropped = false;
    },
    onPerformUpload() {
      const formData = new window.FormData();
      formData.append('mode', this.mode);
      formData.append('atomId', this.atomId);
      formData.append('attachment', this.attachment);
      formData.append('flag', this.flag);
      if (this.mode === 1) {
        formData.append('cropped', this.cropped);
        if (this.cropped) {
          const data = this._cropper.getData();
          for (const key in data) {
            data[key] = parseInt(data[key]);
          }
          formData.append('cropbox', JSON.stringify(data));
        }
      }
      formData.append('file', this.fileBlob);
      return this.$api.post('file/upload', formData)
        .then(data => {
          this.contextCallback(200, data);
          this.$f7router.back();
        });
    },
  },
};

</script>
<style lang="less" scoped>
.image {
  max-width: 100%;
}

.fileName {
  text-align: center;
  color: var(--f7-text-editor-button-text-color);
  padding: 20px 20px;
  background: var(--f7-text-editor-toolbar-bg-color);
  opacity: 0.6;
  user-select: none;
}

</style>
