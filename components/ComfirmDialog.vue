<script setup>
import { ref } from 'vue'

const { t } = useI18n()
const visible = ref(false)
const line1 = ref("")
const line2 = ref("")
let cbconfirm = null
function showConfirm(l1, l2, callbackconfirm) {
  visible.value = true
  line1.value = l1
  line2.value = l2
  cbconfirm = callbackconfirm
}
function confirm() {
  visible.value = false
  if (cbconfirm) cbconfirm()
}
defineExpose({ showConfirm })
</script>
<template>
  <VDialog v-model="visible" width="20em">
    <VCard>
      <VCardTitle class="borderline">
        {{ t('Confirmation') }}
      </VCardTitle>
      <VCardText class="borderline">
        <div>{{ line1 }}</div>
        <div v-if="line2" class="my-2">{{ line2 }}</div>

      </VCardText>
      <VCardActions>
        <VSpacer />
        <v-btn @click="confirm">{{ t('OK') }}</v-btn>
        <v-btn @click="visible = false">{{ t('Cancel') }}</v-btn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.borderline {
  border-bottom: 1px solid #ddd;
}
</style>