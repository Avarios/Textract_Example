<template>
  <div>
    <h1>Dokumentenvalidierung</h1>
    
    <div v-if="!image">
      <h3>Bitte Datei auswählen</h3>
      <div class="custom-file">
        <input type="file" class="custom-file-input" id="customFile" @change="onFileChange" />
        <label class="custom-file-label" for="customFile">Bitte Datei auswählen</label>
      </div>
    </div>
    <div v-else>
      <div class="row">
        <div class="col"></div>
        <div class="col">
          <button
            type="button"
            class="btn btn-primary btn-lg btn-block"
            v-bind:disabled="!uploadURL && !fileName"
            @click="uploadImage"
          >Prüfen</button>
        </div>
        <div class="col"></div>
      </div>

      <br />
      {{fileName}}
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import axios from "axios";
import "vue-loading-overlay/dist/vue-loading.css";
const MAX_IMAGE_SIZE = 1000000;
const API_KEY = process.env.VUE_APP_API_KEY;
const API_URL= process.env.VUE_APP_API_GATEWAY_URL;
export default {
  name: "s3uploader",
  data() {
    return {
      image: "",
      uploadURL: "",
      fileName: ""
    };
  },
  methods: {
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.fileName = files[0].name;
      this.createFile(files[0]);
    },
    createFile(file) {
      // var image = new Image()
      let reader = new FileReader();
      reader.onload = e => {
        this.image = e.target.result;
      };
      this.image = file;
      reader.readAsDataURL(file);
    },
    uploadImage: async function(e) {
      let header = {
          "x-api-key":API_KEY
        }
      this.$emit('onUploadStarted');
      const response = await axios({
        method: "GET",
        url: API_URL,
        headers:header
      });
      let binary = atob(this.image.split(",")[1]);
      let array = [];
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      let blobData = new Blob([new Uint8Array(array)], {
        type: "application/pdf"
      });
      const result = await fetch(response.data.uploadUrl, {
        method: "PUT",
        body: blobData,
        headers:header
      });
      this.result = JSON.stringify(result);
      // Final URL for the user doesn't need the query string params
      this.uploadURL = response.data.uploadUrl.split("?")[0];
      this.image = undefined;
      this.$emit('onFileUploaded',response.data.fileName);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>