<script setup>
import { ref, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useMgmtTokenStore } from "@/store/mgmttoken";
import { INTERCLUBS_ROUNDS, PLAYERS_DIVISION } from '@/util/interclubs'

// communication with manager
const emit = defineEmits(['displaySnackbar',  'changeDialogCounter'])
defineExpose({ setup })

// idtoken
const mgmtstore = useMgmtTokenStore()
const {token: mgmttoken} = storeToRefs(mgmtstore) 
const { $backend } = useNuxtApp()

// datamodel
const idclub = ref(0) 
let idclubold = -1
let roundold = -1
const playerlist_buffer = ref({})
let playersindexed = {}
const icseries = ref([])
const round = ref(-1)
const teamresults = ref([])
const ic_rounds = Object.keys(INTERCLUBS_ROUNDS).map((x)=> {
  return {value: x, title: `R${x}: ${INTERCLUBS_ROUNDS[x]}`}
})
const games = ref([])

const resultchoices = ["1-0","½-½","0-1","1-0 FF", "0-1 FF", "0-0 FF",""]

// methods alphabetically

function calc_points(tr){
  let bphome = 0
  let bpvisit = 0
  let mphome = 0
  let mpvisit = 0
  let allfilled = true
  tr.games.forEach((g) => {
    switch (g.result) {
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
  teams.forEach((t)=>{
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
  emit('changeDialogCounter',1)
  try {
    reply = await $backend("interclub", "anon_getICclub", {
        idclub: clb_id
    })
  } catch (error) {
    displaySnackbar(error.message)
    return
  }
  finally {
    emit('changeDialogCounter', -1)
  }
  let cl = reply.data
  processICplayerlist(cl)
}

async function getICSeries() {
  let reply
  if (!idclub.value) {
    icseries.value = {}
    return
  }
  emit('changeDialogCounter', 1)
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
    emit('changeDialogCounter',-1)
  }
  icseries.value = reply.data
  await readICSeries()
}

function processICplayerlist(ic_clb){
  console.log('processing playerlist', ic_clb.idclub)
  if (!ic_clb && !ic_clb.idclub) return
  let players = ic_clb.players.filter((p) => p.nature != "confirmedout")
  playerlist_buffer.value[ic_clb.idclub] = players
  players.forEach((p) => {
    p.full = `${p.idnumber} ${p.last_name}, ${p.first_name}`
    playersindexed[p.idnumber] = p
  })  
}

async function readICSeries(){
  let tra = []
  teamresults.value = []
  icseries.value.forEach((s)=> {
    const { division, index } = s
    s.rounds[0].encounters.forEach(function(enc) {
      if (enc.icclub_home && enc.icclub_visit){   // skip byes
        if ((enc.icclub_home == idclub.value) || (enc.icclub_visit == idclub.value)) {
          getICclub(enc.icclub_home)
          getICclub(enc.icclub_visit)
          let tr = {
            division: division,
            games: enc.games,
            icclub_home: enc.icclub_home,
            icclub_visit:  enc.icclub_visit,
            index: index,
            name_home: clubLabel(enc.pairingnr_home, s.teams),
            name_visit: clubLabel(enc.pairingnr_visit, s.teams),
            nrgames: PLAYERS_DIVISION[division],
            round: round.value
          }
          for (let i = tr.games.length; i < tr.nrgames; i++) {
            tr.games[i] = {
              idnumber_home: null,
              idnumber_visit: null,
              result: "",
            } 
          }
          tr.games.forEach((g) => {
            if (g.idnumber_home == 0) g.idnumber_home = null
            if (g.idnumber_visit == 0) g.idnumber_visit = null
          })
          calc_points(tr)
          tra.push(tr)
        }
      }
    })
  })
  tra = tra.sort((a,b)=>(a.division - b.division))
  teamresults.value = [ ... tra]
  roundold = round.value
}

async function saveResults(){
  let reply
  try {
    emit('changeDialogCounter', 1)
		reply = await $backend("interclub","mgmt_saveICresults", {
			token: mgmttoken.value,
			results: teamresults.value
		})
  } catch (error) {
    emit('displaySnackbar', error.message)
    return
  }
  finally {
    emit('changeDialogCounter', -1)
  }
  validationdialog.value = false
	emit('displaySnackbar', 'Results saved')
}

function setup(clb, rnd){
  console.log('setup results', clb)
  idclub.value = clb.idclub
  round.value = rnd
  if (!clb.idclub) {
    playerlist_buffer.value = {}
    teamresults.value = []
    icseries.value = []
    return
  }
  if (!playerlist_buffer[idclub.value] ) {
    processICplayerlist(clb)
  }
  if (roundold != round) {
    getICSeries()  
  }
}

</script>

<template>
  <v-container v-if="!idclub">
    No club selected.
  </v-container>
	<v-container v-if="idclub">
    <VBtn color="purple" @click="saveResults">Save results</VBtn>
    <v-card v-for="tr in teamresults" class="my-2">
      <v-card-title>
        Division {{ tr.division }}{{ tr.index }}: &nbsp; 
        {{ tr.icclub_home }} {{ tr.name_home }} -
        {{ tr.icclub_visit }}  {{ tr.name_visit}}
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row v-for="(g,ix) in tr.games" class="d-flex">
            <v-col cols="5">            
              <VAutocomplete v-model="g.idnumber_home" density="compact" clearable
                  :items="playerlist_buffer[tr.icclub_home]" item-title="full" 
                  item-value="idnumber" :label="`Player home ${ix+1}`" :hide-details="true" 
              />
            </v-col>
            <v-col cols="2">
              <VSelect v-model="g.result" :items="resultchoices" 
                density="compact"  :hide-details="true" @update:model-value="calc_points(tr)"/>
            </v-col>
            <v-col col="5">
              <VAutocomplete v-model="g.idnumber_visit" density="compact" 
                  :items="playerlist_buffer[tr.icclub_visit]" item-title="full" item-value="idnumber" 
                  :label="`Player visit ${ix+1}`" :hide-details="true" 
                  clearable
              />            
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
  </v-container>
</template>

