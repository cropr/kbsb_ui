<template>
    <span class="fieldname">{{ i18n_field }}</span>
</template>
  
<script>

import { boardroles } from '@/util/boardroles';

export default {

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
      console.log('fieldname', this.fieldname, this.$i18n.locale)
      if (this.fieldname in boardroles) {
        return boardroles[this.fieldname][this.$i18n.locale] || ""
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