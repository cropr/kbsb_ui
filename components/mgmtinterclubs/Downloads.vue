<script setup>
import { useMgmtTokenStore } from "@/store/mgmttoken";
import { VContainer, VBtn } from "vuetify/components";
import { storeToRefs } from 'pinia'

// communication with manager
const emit = defineEmits(['displaySnackbar',  'changeDialogCounter'])
const props = defineProps(["icclub", "round"])
defineExpose({ setup })

const mgmtstore = useMgmtTokenStore()
const {token: mgmttoken} = storeToRefs(mgmtstore)
const runtimeConfig = useRuntimeConfig(); 


function d() {
  console.log('token', mgmttoken.value)
  const url = `${runtimeConfig.public.apiurl}api/v1/interclubs/mgmt/command/xls/allplayerlist?token=${mgmttoken.value}`
  window.location.href = url
}

function setup(){
  console.log('setup downloads')
}

</script>
<template>
  <v-container>
    <h3>Excel Downloads</h3>
    <v-btn @click="d">Download all playerlist</v-btn>
  </v-container>
</template>

