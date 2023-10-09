<script setup>
import { computed } from 'vue'
import { BOARDROLES } from '@/util/club';

const { locale } = useI18n()
const props = defineProps(['fieldname'])

const i18n_field = computed(()=> {
  if (props.fieldname in BOARDROLES) {
      return BOARDROLES[props.fieldname][locale] || ""
    }
  else return ""
})

</script>

<template>
    <span class="fieldname">{{ i18n_field }}</span>
</template>
  

<style scoped>
.fieldname {
  color: green;
}
</style>