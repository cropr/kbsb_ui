<script setup>
import { ref } from 'vue'

// stores
import { useMgmtTokenStore } from "@/store/mgmttoken"
import { storeToRefs } from 'pinia'
const mgmtstore = useMgmtTokenStore()
const { token: mgmttoken } = storeToRefs(mgmtstore)

// communication
defineExpose({ updateClub })
const { $backend } = useNuxtApp()

//  snackbar, loading and confirm widgets
import ProgressLoading from '@/components/ProgressLoading.vue'
import SnackbarMessage from '@/components/SnackbarMessage.vue'
import ConfirmDialog from '@/components/ComfirmDialog.vue'
const refsnackbar = ref(null)
const refloading = ref(null)
const refconfirm = ref(null)
let showSnackbar, showLoading, showConfirm

// datamodel
const idclub = ref(0)
const icseries = ref([])
const teamchoices = ref([])
const teamselected = ref(null)

// methods alphabetically

function confirmForfeit() {
  showConfirm(`Are you sure to register a forfeiting for team ${teamselected.value.name}? ` +
    "This will erase all results of this team, an action which cannot be undone easily.",
    "Important remark:  Don't use this routine for the final round. " +
    "  For the last round you should overrule all results of team manually.",
    forfeitConfirmed)
}

async function forfeitConfirmed() {
  console.log("forfaiting confirmed")
  let reply
  try {
    showLoading(true)
    reply = await $backend("interclub", "mgmt_register_teamforfeit", {
      token: mgmttoken.value,
      division: teamselected.value.division,
      index: teamselected.value.index,
      name: teamselected.value.name,
    })
  } catch (error) {
    showSnackbar(error.message)
    return
  }
  finally {
    showLoading(false)
  }
  showSnackbar('Team forfeiting saved')
}

async function getICSeries() {
  console.log("team forfeit get IC series")
  // get the pairing data limited to current club 
  let reply
  if (!idclub.value) {
    icseries.value = {}
    return
  }
  showLoading(true)
  try {
    reply = await $backend("interclub", "mgmt_getICseries", {
      idclub: idclub.value,
      token: mgmttoken.value
    })
  } catch (error) {
    console.log('NOK', error)
    if (error.code == 401) {
      // TODO
    }
    return
  } finally {
    showLoading(false)
  }
  icseries.value = reply.data
  await processICSeries()
}

async function processICSeries() {
  // process the series received from the server
  teamchoices.value = []
  icseries.value.forEach((s) => {
    s.teams.forEach((t) => {
      if (t.idclub == idclub.value && !t.teamforfeit) {
        teamchoices.value.push({
          title: `${t.name} (${t.division}${t.index})`,
          value: t,
        })
      }
    })
  })
}

async function registerForfait() {
  let reply
  try {
    showLoading(true)
    reply = await $backend("interclub", "mgmt_saveICresults", {
      token: mgmttoken.value,
      results: teamresults.value
    })
  } catch (error) {
    showSnackbar(error.message)
    return
  }
  finally {
    showLoading(false)
  }
  showSnackbar('Results saved')
}

async function updateClub(clb) {
  idclub.value = clb.idclub
  teamselected.value = null
  await getICSeries()
}

onMounted(() => {
  showSnackbar = refsnackbar.value.showSnackbar
  showLoading = refloading.value.showLoading
  showConfirm = refconfirm.value.showConfirm
})

</script>

<template>
  <VContainer>
    <SnackbarMessage ref="refsnackbar" />
    <ProgressLoading ref="refloading" />
    <ConfirmDialog ref="refconfirm" />
    <h2>Team Forfeiting</h2>
    <p v-if="!idclub">Select a club to register a team forfeit</p>
    <div v-if="idclub">
      <p>Select the team which is forfeiting</p>
      <v-select v-model="teamselected" :items="teamchoices" />
      <v-btn @click="confirmForfeit">Confirm</v-btn>
    </div>
  </VContainer>
</template>

