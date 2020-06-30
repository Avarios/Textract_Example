<template>
  <div class="row">
    <div class="col">
      <form v-if="result.sender.length > 3">
        <div class="form-group">
          <label for="exampleInputEmail1">Versender <i class="fas fa-check"></i></label>
          <input
            type="email"
            disabled
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            v-model="result.sender[0]"
          />
          <label for="exampleInputEmail1">Adresse</label>
          <input
            type="email"
            disabled
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            v-model="result.sender[1]"
          />
          <label for="exampleInputEmail1">Plz/Ort</label>
          <input
            type="email"
            disabled
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            v-model="result.sender[2]"
          />
          <label for="exampleInputEmail1">Land</label>
          <input
            type="email"
            disabled
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            v-model="result.sender[3]"
          />
        </div>
      </form>
      <form v-else>
        <label for="exampleInputEmail1">Versender</label>
        <input
          type="email"
          disabled
          class="form-control border border-error"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          value="Es fehlen die Daten des Versenders !"
        />
      </form>
    </div>
    <div class="col">
      <form v-if="result.consignee.length > 3">
        <div class="form-group">
          <label for="exampleInputEmail1">Empfänger <i class="fas fa-check"></i></label>
          <input
            type="email"
            disabled
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            v-model="result.consignee[0]"
          />
          <label for="exampleInputEmail1">Adresse</label>

          <input
            type="email"
            disabled
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            v-model="result.consignee[1]"
          />
          <label for="exampleInputEmail1">Plz/Ort</label>

          <input
            type="email"
            disabled
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            v-model="result.consignee[2]"
          />
          <label for="exampleInputEmail1" >Land</label>
          <input v-if="country"
            type="email"
            disabled
            class="form-control"
            id="conCon"
            aria-describedby="emailHelp"
            v-model="result.consignee[3]"
          />
          <input v-else
            type="email"
            disabled
            class="form-control border border-error"
            id="conConWrong"
            aria-describedby="emailHelp"
            v-model="countryWrongText"
          />
        </div>
      </form>
      <form v-else>
        <label for="exampleInputEmail1">Empfänger</label>
        <input
          type="email"
          disabled
          class="form-control border border-error"
          id="errEmpf"
          aria-describedby="emailHelp"
          value="Es fehlen die Empfängerdaten !"
        />
      </form>
    </div>
  </div>
</template>
<script>
export default {
  name: "Result",
  props: {
    result: []
  },
  computed:{
      country: function() {
          var reges = new RegExp("^[0-9]*$");
          let result= reges.exec(this.result.consignee[3].replace(/\s/g,''))
          return !result;
      },
      countryWrongText: function() {
          return `Das Land: ${this.result.consignee[3]} ist falsch `;
      }
  }
};
</script>