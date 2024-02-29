<script setup>
import { ref } from 'vue'

const visible = ref(false)
const title = ref("")
const line1 = ref("")
const line2 = ref("")
const color = ref("")

let cbconfirm = null

function showConfirm(callback, t1, l1, l2, c) {
  visible.value = true
  line1.value = l1
  line2.value = l2
  title.value = t
  color.value = c
  cbconfirm = callback
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
      <VCardTitle class="borderline" :color="color">
        {{ title }}
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