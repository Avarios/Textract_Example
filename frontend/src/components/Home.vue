<template>
  <div class="container">
    <loading :active.sync="isLoading" :can-cancel="false" :is-full-page="true"></loading>
    <NavBar></NavBar>
    <div class="row">
      <div class="col-sm">
        <div class="alert alert-info"></div>
        <fileUpload @onFileUploaded="onFileUploaded" @onUploadStarted="onUploadStarted" />
        <br />
      </div>
    </div>
    <div class="row" v-if="showPollerInfo">
      <div class="col"></div>
      <div class="col">
        <Polling></Polling>
      </div>
      <div class="col"></div>
    </div>
    <ResultView v-if="result" v-bind:result="result" />
    <div v-if="!result && error" class="row">
      <div class="jumbotron border border-danger">
        <h1 class="display-4">ERROR</h1>No Sender or Reciever was readable.
        <br />Please correct the missing Fields and
        <br />reupload the Document again
      </div>
    </div>
  </div>
</template>

<script>
import FileUpload from "./S3Uploader";
import NavBar from "./NavBar";
import Polling from "./Polling";
import ResultView from "./Result";
import Loading from "vue-loading-overlay";
import axios from "axios";
const API_KEY = process.env.VUE_APP_API_KEY;
const API_URL= process.env.VUE_APP_API_GATEWAY_URL;
export default {
  name: "Home",
  data: function() {
    return {
      result: undefined,
      error: undefined,
      mapShow: false,
      isLoading: false,
      showPollerInfo: false
    };
  },
  methods: {
    async onFileUploaded(fileName) {
      let poller = setInterval(async () => {
        this.showPollerInfo = true;
        let header = {
          "x-api-key":API_KEY
        }
        let result = await axios.post(API_URL, { fileName: fileName } , {headers: header});
        if (result.data.status === "COMPLETED") {
          clearInterval(poller);
          this.result = {
            sender: result.data.sender,
            consignee: result.data.consignee
          };
          this.isLoading = false;
          this.showPollerInfo = false;
        }
        if (result.data.status === "ERROR") {
          clearInterval(poller);
          this.error = result.data.error;
          this.isLoading = false;
          this.showPollerInfo = false;
        }
      }, 4000);
    },
    onUploadStarted() {
      this.result = undefined;
      this.isLoading = true;
    }
  },
  components: {
    FileUpload,
    NavBar,
    Polling,
    Loading,
    ResultView
  }
};
</script>

<style>
</style>
