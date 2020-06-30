<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">POC Textract</a>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
      v-bind:onClick="onLogoutClick"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        <div class="row">
          <div class="col"></div>
          <div class="col">
            <img alt="Vue logo" src="../assets/aws.png" />
          </div>
          <div class="col"></div>
        </div>
      </ul>
      <form class="form-inline my-2 my-lg-0">
        <button
          v-bind:onClick="onLogoutClick"
          class="btn btn-outline-success my-2 my-sm-0"
          to="/logout"
        >User</button>
      </form>
    </div>
  </nav>
</template>

<script>
export default {
  name: "navbar",
  methods: {
    onLogoutClick() {
      this.$router.push("/logout");
    },
    onHomeClick() {
      this.$router.push("/");
    }
  }
};
</script>
<style>
img {
  height: 100%px;
  width: 70px;
}
</style>