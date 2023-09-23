<script setup>
// i18n
const { t: $t } = useI18n()
</script>
<template>
	<v-container>
    <v-alert type="warning" variant="outlined" closable 
        :text="$t('The player list can no longer be modified')" />
  </v-container>
</template>

<style scoped>
.imported {
  color: purple;
  font-weight: 500;
}
.exported {
  color: rgb(186, 185, 185);
}

</style>
