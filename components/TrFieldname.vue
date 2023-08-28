<template>
    <span class="fieldname">{{ i18n_field }}</span>
</template>
  
<script>

import { BOARDROLES } from '@/util/club';

export default {

  props: {
    fieldname: String
  },

  computed: {
    i18n_field (){
      if (this.fieldname in BOARDROLES) {
        return BOARDROLES[this.fieldname][this.$i18n.locale] || ""
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