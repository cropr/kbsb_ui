<template>
    <span class="fieldname">{{ i18n_field }}</span>
</template>
  
<script>
export default {
  
  async fetch() {
    this.boardroles = (await this.$content("boardroles").fetch()).boardroles;
    console.log('boardroles', this.boardroles)
  },

  data() {
    return {
      boardroles: [],
    };
  },

  props: {
    fieldname: String
  },

  computed: {
    i18n_field (){
      console.log('fieldname', this.fieldname, this.$i18n.locale, this.boardroles)
      if (this.fieldname in this.boardroles) {
        return this.boardroles[this.fieldname][this.$i18n.locale] || ""
      }
      else return ""
    }
  },


}
</script>
<style scoped>
.fieldname {
  color: green;
}
</style>