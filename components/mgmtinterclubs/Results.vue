<script setup>
import { ref } from 'vue'
import { INTERCLUBS_ROUNDS, PLAYERS_DIVISION } from '@/util/interclubs'

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
const idclub = ref(0)
let roundold = -1
const playerlist_buffer = ref({})
let playersindexed = {}
const icseries = ref([])
const round = ref(-1)
const teamresults = ref([])
const ic_rounds = Object.keys(INTERCLUBS_ROUNDS).map((x) => {
  return { value: x, title: `R${x}: ${INTERCLUBS_ROUNDS[x]}` }
})
const games = ref([])

const resultchoices = ["1-0", "½-½", "0-1", "1-0 FF", "0-1 FF", "0-0 FF", ""]

const overrulechoices = [
  { title: "No overruling", value: "" },
  { title: "1-0", value: "1-0" },
  { title: "½-½", value: "½-½" },
  { title: "0-1", value: "0-1" },
  { title: "1-0 FF", value: "1-0 FF" },
  { title: "0-1 FF", value: "0-1 FF" },
  { title: "0-0 FF", value: "0-0 FF" },
]

// methods alphabetically

function calc_points(tr) {
  let bphome = 0
  let bpvisit = 0
  let mphome = 0
  let mpvisit = 0
  let allfilled = true
  tr.games.forEach((g) => {
    let result = g.overruled ? g.overruled : g.result
    switch (result) {
      case "1-0":
      case "1-0 FF":
        bphome += 2
        break
      case "½-½":
        bphome += 1
        bpvisit += 1
        break
      case "0-1":
      case "0-1 FF":
        bpvisit += 2
        break
      case "":
        allfilled = false
        break;
    }
  })
  tr.boardpoints = `${bphome / 2}-${bpvisit / 2}`
  if (!allfilled) {
    tr.matchpoints = ""
  }
  else {
    if (bphome > bpvisit) tr.matchpoints = "2-0"
    if (bphome == bpvisit) tr.matchpoints = "1-1"
    if (bphome < bpvisit) tr.matchpoints = "0-2"
  }
}

function clubLabel(pairingnr, teams) {
  let name = ""
  teams.forEach((t) => {
    if (t.pairingnumber == pairingnr) {
      name = t.name
      return
    }
  })
  return name
}

async function getICclub(clb_id) {
  console.log('gettting playerlist', clb_id)
  if (playerlist_buffer.value[clb_id]) {
    console.log('playerlist in cache', clb_id)
    return
  }
  console.log('calling anon_getICclub', clb_id)
  let reply
  showLoading(true)
  try {
    reply = await $backend("interclub", "anon_getICclub", {
      idclub: clb_id
    })
  } catch (error) {
    snowSnackbar(error.message)
    return
  }
  finally {
    showLoading(false)
  }
  let cl = reply.data
  processICplayerlist(cl)
}

async function getICSeries() {
  // get the pairing data limited to current round and club 
  let reply
  if (!idclub.value) {
    icseries.value = {}
    return
  }
  showLoading(true)
  try {
    reply = await $backend("interclub", "mgmt_getICseries", {
      round: round.value,
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

function processICplayerlist(ic_clb) {
  console.log('processing playerlist', ic_clb.idclub)
  if (!ic_clb && !ic_clb.idclub) return
  let players = ic_clb.players.filter((p) => p.nature != "confirmedout")
  playerlist_buffer.value[ic_clb.idclub] = players
  players.forEach((p) => {
    p.full = `${p.idnumber} ${p.last_name}, ${p.first_name}`
    playersindexed[p.idnumber] = p
  })
}

async function processICSeries() {
  // process the pairing data received from the server
  let tra = []
  teamresults.value = []
  icseries.value.forEach((s) => {
    const { division, index } = s
    s.rounds[0].encounters.forEach(function (enc) {
      // skip byes
      if (!enc.icclub_home || !enc.icclub_visit) return
      // skip encounters of other clubs
      if (![enc.icclub_home, enc.icclub_visit].includes(idclub.value)) return
      getICclub(enc.icclub_home)
      getICclub(enc.icclub_visit)
      let encounter = {
        division: division,
        games: enc.games,
        icclub_home: enc.icclub_home,
        icclub_visit: enc.icclub_visit,
        index: index,
        name_home: clubLabel(enc.pairingnr_home, s.teams),
        name_visit: clubLabel(enc.pairingnr_visit, s.teams),
        nrgames: PLAYERS_DIVISION[division],
        pairingnr_home: enc.pairingnr_home,
        pairingnr_visit: enc.pairingnr_visit,
        round: round.value
      }
      // fill in default games if not yet existing
      for (let i = encounter.games.length; i < encounter.nrgames; i++) {
        encounter.games[i] = {
          idnumber_home: null,
          idnumber_visit: null,
          result: "",
          overruled: "",
        }
      }
      encounter.games.forEach((g) => {
        if (g.idnumber_home == 0) g.idnumber_home = null
        if (g.idnumber_visit == 0) g.idnumber_visit = null
        if (!g.overruled) g.overruled = ""
      })
      calc_points(encounter)
      tra.push(encounter)
    })
  })
  tra = tra.sort((a, b) => (a.division - b.division))
  teamresults.value = [...tra]
  roundold = round.value
}

async function saveResults() {
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

function updateClub(clb) {
  idclub.value = clb.idclub
  if (!clb.idclub) {
    playerlist_buffer.value = {}
    teamresults.value = []
    icseries.value = []
    return
  }
  if (!playerlist_buffer[idclub.value]) {
    processICplayerlist(clb)
  }
}

function updateRound(rnd) {
  round.value = rnd
  getICSeries()
}

onMounted(() => {
  showSnackbar = refsnackbar.value.showSnackbar
  showLoading = refloading.value.showLoading
})

</script>

<template>
  <VContainer>
    <SnackbarMessage ref="refsnackbar" />
    <ProgressLoading ref="refloading" />
    <h2>Results</h2>
    <p v-if="!idclub">Please select a club to view the interclubs player list</p>
    <div v-if="idclub">
      <VBtn color="purple" @click="saveResults">Save results</VBtn>
      <v-card v-for="tr in teamresults" class="my-2">
        <v-card-title>
          Division {{ tr.division }}{{ tr.index }}: &nbsp;
          {{ tr.icclub_home }} {{ tr.name_home }} -
          {{ tr.icclub_visit }} {{ tr.name_visit }}
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row v-for="(g, ix) in tr.games" class="d-flex">
              <v-col cols="4">
                <VAutocomplete v-model="g.idnumber_home" density="compact" clearable
                  :items="playerlist_buffer[tr.icclub_home]" item-title="full" item-value="idnumber"
                  :label="`Player home ${ix + 1}`" :hide-details="true" />
              </v-col>
              <v-col cols="2">
                <VSelect v-model="g.result" :items="resultchoices" density="compact"
                  :hide-details="true" @update:model-value="calc_points(tr)" />
              </v-col>
              <v-col col="4">
                <VAutocomplete v-model="g.idnumber_visit" density="compact"
                  :items="playerlist_buffer[tr.icclub_visit]" item-title="full" item-value="idnumber"
                  :label="`Player visit ${ix + 1}`" :hide-details="true" clearable />
              </v-col>
              <v-col cols="2">
                <VSelect v-model="g.overruled" :items="overrulechoices" density="compact"
                  :hide-details="true" @update:model-value="calc_points(tr)" />
              </v-col>
            </v-row>
            <VDivider />
            <v-row class="mt-1">
              <v-col cols="2">
                MP: {{ tr.matchpoints }}
              </v-col>
              <v-col cols="2">
                BP: {{ tr.boardpoints }}
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
      <VBtn color="purple" @click="saveResults">Save results</VBtn>
    </div>
  </VContainer>
</template>

