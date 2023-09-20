<script setup>
import { ref } from 'vue'
import { useIdtokenStore}  from '@/store/idtoken'
import { storeToRefs } from 'pinia'
import { INTERCLUBS_ROUNDS, PLAYERS_DIVISION } from '@/util/interclubs'

// commumication with manager
const emit = defineEmits(['displaySnackbar',  'changeDialogCounter'])
const props = defineProps(["icclub"])
defineExpose({ readICclub })

// idtoken
const idstore = useIdtokenStore()
const { token: idtoken } = storeToRefs(idstore)

const idclub = ref(0) 
const { t } = useI18n()
const { $backend } = useNuxtApp()


//icseries
let playersindexed = {}
const players = ref([])
const icseries = ref({})
const accessdenied = ref(true)
const round = ref("1")
const ic_rounds = Object.keys(INTERCLUBS_ROUNDS).map((x)=> {
  return {value: x, title: `R${x}: ${INTERCLUBS_ROUNDS[x]}`}
})
const teamsplanning = ref({})
const games = ref([])

// validation
const validationdialog = ref(false)
const validationerrors = ref([])


// methods alphabetically

function clubLabel(pairingnr, s) {
  let name = ""
  s.teams.forEach((t)=>{
    if (t.pairingnumber == pairingnr) {
      name = t.name
      return
    }
  })
  return name
}


function filterPlayers(){
  players.value = props.icclub.value.players.filter((p) => p.nature != "confirmedout")
  players.value.forEach((p) => {
    p.full = `${p.idnumber} ${p.last_name}, ${p.first_name}`
  })  
}

async function readICclub(){
  console.log('read IC club from manager', props.icclub.idclub)
  idclub.value = props.icclub.idclub
  if (!idclub.value) {
    accessdenied.value = true
    players.value = []
    return
  }
  players.value = []
  playersindexed.value = {}
  teamsplanning.value = {}
  props.icclub.players.forEach((p) => {
    let player = {}
    let tit = p.titular ? `:: ${t('Titular')} ${p.titular}` : ""
    if (p.nature != "confirmedout") {
      player.first_name = p.first_name
      player.last_name = p.last_name
      player.assignedrating = p.assignedrating
      player.idnumber = p.idnumber
      player.titular = p.titular
      player.full = `${p.idnumber}: ${p.last_name}, ${p.first_name} -- ${p.assignedrating} ${tit}`      
    }
    players.value.push(player)
    playersindexed[p.idnumber] = player    
  })
  let reply
  idclub.value = props.icclub.idclub
  if (!idclub.value) return
  emit('changeDialogCounter', 1)
  try {
    reply = await $backend("club", "verify_club_access", {
      idclub: idclub.value,
      role: "InterclubAdmin,InterclubCaptain",
      token: idtoken.value,
    })
    accessdenied.value = false
  } catch (error) {
    if (error.code == 401) {
      accessdenied.value = true
    } 
    return
  } finally {
    emit('changeDialogCounter',-1)
  }
}


async function readICSeries() {
  console.log('read IC series')
  let reply
  idclub.value = props.icclub.idclub
  if (!idclub.value) {
    icseries.value = {}
    return
  }
  emit('changeDialogCounter', 1)
  try {
    reply = await $backend("interclub", "clb_getICseries", {
      round: round.value,
      idclub: idclub.value,
      token: idtoken.value
    })
    console.log('OK')
    accessdenied.value = false
  } catch (error) {
    console.log('NOK', error)
    if (error.code == 401) {
      accessdenied.value = true
    } 
    return
  } finally {
    emit('changeDialogCounter',-1)
  }
  icseries.value = reply.data
  teamsplanning.value = []
  nextTick(()=>{ fillPlanning()})
}

function fillPlanning(){
  console.log('fillPlanning')
  icseries.value.forEach((s) => {
    // fill in Teams
    s.teams.forEach((t) => {
      let sround = s.rounds[0]
      if(t.idclub == idclub.value) {
        let team = { 
          division: t.division,
          games: [],
          idclub: idclub.value,
          index: s.index,
          pairingnumber: t.pairingnumber,
          name: t.name,
          nrgames: PLAYERS_DIVISION[t.division],
          round: parseInt(round.value),
        }
        let avg = 0
        let allassigned = true
        sround.encounters.forEach((enc, encix) => {
          if (enc.icclub_home == idclub.value && enc.pairingnr_home == t.pairingnumber) {
            team.playinghome = true
            team.idclub_opponent = enc.icclub_visit
            team.name_opponent =  clubLabel(enc.pairingnr_visit, s)
            team.games = enc.games
          }
          else if (enc.icclub_visit == idclub.value && enc.pairingnr_visit == t.pairingnumber) {
            team.playinghome = false
            team.idclub_opponent = enc.icclub_home
            team.name_opponent = clubLabel(enc.pairingnr_home, s)
            team.games = enc.games
          }
        })
        for (let i = team.games.length; i < team.nrgames; i++) {
          team.games[i] = {
            idnumber_home: null,
            idnumber_visit: null,
            result: "",
          } 
        }
        team.games.forEach((g) => {
          if (g.idnumber_home == 0) g.idnumber_home = null
          if (g.idnumber_visit == 0) g.idnumber_visit = null
          if (team.playinghome){
            if (!g.idnumber_home) {
              allassigned = false
            }
            else {
              avg += playersindexed[g.idnumber_home].assignedrating
              console.log('avg increased', avg)
            }
          }
          else {
            if (!g.idnumber_visit) {
              allassigned = false
            }
            else {
              avg += playersindexed[g.idnumber_visit].assignedrating
            }
          }
          team.average = allassigned ? avg / team.nrgames : 0
        })
        // do nothing it for BYE
        if (team.idclub_opponent) teamsplanning.value.push(team)
      } 
    })
  })
}

async function savePlanning(){
  let reply
  console.log('saving planning', teamsplanning.value)
  try {
    emit('changeDialogCounter', 1)
		reply = await $backend("interclub","clb_saveICplanning", {
      token: idtoken.value,
      plannings: teamsplanning.value
		})
  } catch (error) {
    if (error.code == 401) gotoLogin()
    emit('displaySnackbar', t(error.message))
    return
  }
  finally {
    emit('changeDialogCounter',-1)
  }
  validationdialog.value = false
	emit('displaySnackbar', t('Playerlist saved'))
  readICSeries()
}

async function validatePlanning(){
  let reply
  savePlanning()
  // try {
  //   emit('changeDialogCounter', 1)
	// 	reply = await $backend("interclub","clb_validateICplanning", {
	// 		token: idtoken.value,
	// 		idclub: idclub.value,
	// 		players: players.value,
	// 	})
  // } catch (error) {
  //   if (error.code == 401) gotoLogin()
  //   emit('displaySnackbar', t(error.message))
  //   return
  // }
  // finally {
  //   emit('changeDialogCounter',-1)
  // }
  // console.log('reply.data', reply.data)
  // validationerrors.value = reply.data
  // if (validationerrors.value.length) {
  //   validationdialog.value = true
  // }
  // else {
  //   savePlanning()
  // }
   
}

 
</script>
<template>
	<v-container>

    <div v-if="!idclub">
      <v-alert  type="warning" variant="outlined" closable 
        :text="t('Please select a club to view the interclubs planning tool')"/>
    </div>
    <div v-if="idclub">
      <div v-if="accessdenied">
      <v-alert type="error" variant="outlined" closable 
        :text="t('Permission denied')" />
    </div> 
    <div v-if=" !accessdenied">     
      <v-row>
        <v-col cols="8" sm="5">
          <VSelect v-model="round" :items="ic_rounds" :label="t('Round')">
          </VSelect>
        </v-col>
        <v-col cols="4" sm="2">
          <VBtn icon="mdi-play" @click="readICSeries()"></VBtn>
        </v-col>
      </v-row>
      <VCard v-for="(tp,ix) in teamsplanning" class="my-2">
        <VCardTitle>
          {{ tp.name }}
        </VCardTitle>
        <VCardSubtitle class="d-flex">
          <div v-show="tp.playinghome" class="flex-1-1-100">
            {{  tp.idclub }} {{tp.name}} - {{ tp.idclub_opponent  }} {{ tp.name_opponent }}
          </div>
          <div v-show="!tp.playinghome" class="flex-1-1-100">
            {{ tp.idclub_opponent  }} {{ tp.name_opponent }} - {{  tp.idclub }} {{tp.name}}
          </div>
          <div class="flex-0-0" >
            {{ t('Average ELO') }}: {{ tp.average }}
          </div>
          <VDivider />
        </VCardSubtitle>
        <VCardText>
          <div v-for="(g,ix) in tp.games" class="d-flex">
            <div class="flex-0-0 cw">{{ ix+1 }}
            </div>
            <VAutocomplete v-model="g.idnumber_home" density="compact" 
                :items="players" item-title="full" item-value="idnumber" 
                :label="t('Player')" :hide-details="true" 
                class="flex-fill" v-show="tp.playinghome" clearable
            />
            <VAutocomplete v-model="g.idnumber_visit" density="compact" 
                :items="players" item-title="full" item-value="idnumber" 
                :label="t('Player')" :hide-details="true" 
                class="flex-fill" v-show="!tp.playinghome" clearable
            />
          </div>
        </VCardText>
      </VCard>
      <div v-show="icseries.length">
        <VBtn @click="validatePlanning()" color="primary">{{ $t('Save') }}</VBtn>
      </div>
    </div>      
    </div>

		<VDialog v-model="validationdialog"  width="30em">
			<VCard>
				<VCardTitle>
					{{ $t('Validation of planning.')}}
					<VDivider />
				</VCardTitle>
				<VCardText class="markdowncontent">
					<div>{{ $t("The planning contains validation errors") }}</div>
          <ul>
            <li v-for="(err, ix) in validationerrors" :key="ix">           
            </li>
          </ul>
          <VDivider />
				</VCardText>
				<VCardActions>
					<VSpacer />
					<VBtn @click="savePlanning()">{{ $t('Save anyhow') }}</VBtn>
					<VBtn @click="validationdialog = false">{{ $t('Cancel') }}</VBtn>
				</VCardActions>
			</VCard> 
		</VDialog>    
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
.cw {
  min-width: 2em;
}
</style>
