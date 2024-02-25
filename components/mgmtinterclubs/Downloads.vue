<script setup>
import { ref } from 'vue'
import { VContainer, VBtn } from "vuetify/components";

// stores
import { useMgmtTokenStore } from "@/store/mgmttoken"
import { storeToRefs } from 'pinia'
const mgmtstore = useMgmtTokenStore()
const { token: mgmttoken } = storeToRefs(mgmtstore) 

// communication 
defineExpose({ updateClub, updateRound })
const { $backend } = useNuxtApp()

//  snackbar and loading widgets
import ProgressLoading from '@/components/ProgressLoading.vue'
import SnackbarMessage from '@/components/SnackbarMessage.vue'
const refsnackbar = ref(null)
let showSnackbar
const refloading = ref(null)
let showLoading


// datamodel
const club = ref(null)
const round = ref(null)
const runtimeConfig = useRuntimeConfig(); 


function d() {
  console.log('token', mgmttoken.value)
  const url = `${runtimeConfig.public.apiurl}api/v1/interclubs/mgmt/command/xls/allplayerlist?token=${mgmttoken.value}`
  window.location.href = url
}

async function generateBelELO(){
  showLoading(true)
  try {
    const reply = await $backend("interclub", "mgmt_generate_bel_elo",{
      round: round.value,
      token: mgmttoken.value,
    })    
    showSnackbar("BEL elo rapport created")
  }
  catch(error) {
    showSnackbar(error.message)
  }
  finally {
    showLoading(false)
  }
}

async function generateFideELO(){
  showLoading(true)
  try {
    const reply = await $backend("interclub", "mgmt_generate_fide_elo",{
      round: round.value,
      token: mgmttoken.value,
    })    
    showSnackbar("FIDE elo rapport created")
  }
  catch(error) {
    console.error(error)
    showSnackbar(error.message)
  }
  finally {
    showLoading(false)
  }
}

function updateClub(clb){
  club.value = clb
}

function updateRound(rnd){
  round.value = rnd 
}

// trigger
onMounted( () => {
  showSnackbar = refsnackbar.value.showSnackbar
  showLoading = refloading.value.showLoading
})

</script>
<template>
  <VContainer>
    <SnackbarMessage ref="refsnackbar" />
    <ProgressLoading ref="refloading"/>
    <h3>Playerlist</h3>
    <v-btn @click="d">Download full playerlist</v-btn>
    <h3 class="mt-3">ELO processing</h3>
    <VBtn class="ma-2" @click="generateFideELO" disabled>Generate FIDE rapport</VBtn>
    <VBtn class="ma-2" @click="generateBelELO" disabled>Generate BEL rapport</VBtn>
    <!-- <VBtn class="ma-2" @click="generateFideELO" >Generate FIDE rapport</VBtn>
    <VBtn class="ma-2" @click="generateBelELO" >Generate BEL rapport</VBtn> -->
    <h4 class="mt-2">Availabale ELo rapports</h4>
  </VContainer>
</template>

