<script setup>
import { nextTick } from "vue";
import { useMgmtTokenStore } from "@/store/mgmttoken";
import { storeToRefs } from 'pinia'

const mgmtstore = useMgmtTokenStore()
const {token: mgmttoken} = storeToRefs(mgmtstore)
const runtimeConfig = useRuntimeConfig(); 


function d() {
  console.log('token', mgmttoken.value)
  const url = `${runtimeConfig.public.apiurl}api/v1/interclubs/mgmt/command/xls/allplayerlist?token=${mgmttoken.value}`
  window.location.href = url
}


</script>
<template>
  <v-container>
    <h3>Excel Downloads</h3>
    <v-btn @click="d">Download all playerlist</v-btn>
  </v-container>
</template>

