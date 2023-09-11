<script setup>
import { ref } from 'vue'
import Playerlistorder from './Playerlistorder.vue';
import { useIdtokenStore}  from '@/store/idtoken'
import { storeToRefs } from 'pinia'
import { PLAYERSTATUS } from "@/util/interclubs"
const props = defineProps(["icclub", "members"])
const idclub = ref(0) 
const enrolled = ref(null)

const emit = defineEmits(['displaySnackbar',  'changeDialogCounter'])
const { t } = useI18n()
const { $backend } = useNuxtApp()
const idstore = useIdtokenStore()
const { token: idtoken } = storeToRefs(idstore)


// playerlist
let playersindexed = {}
const players = ref([])
const playeredit = ref({})
const editdialog = ref(false)
const exportalldialog = ref(false)
const exportallvisit = ref(false)
const exportdialog = ref(false)

// validation
const validationdialog = ref(false)
const validationerrors = ref([])

// data table definiton
const headers = [
  { title: "N", key: "index"},
	{ title: t('Name'), key: 'fullname' },
	{ title: t("ID number"), key: 'idnumber', sortable: false },
	{ title: "ELO", key: "assignedrating" },
	{ title: "Club", key: "idcluborig" },
	{ title: t("Titular"), key: "titular" },
	{ title: t("Status"), key: "nature"},
	{ title: t("Action"), key:"action" },
]
const itemsPerPage = 50
const itemsPerPageOptions = [
  {value: 50, title: '50'},
  {value: 150, title: '150'},
  {value: -1, title: 'All'}
]


const titularchoices = [{title: t("No titular"), value:""}]


// methods alphabetically

function canEdit(idnumber){
  return [PLAYERSTATUS.assigned, PLAYERSTATUS.comfirmedin, PLAYERSTATUS.requestedin].includes(
    playersindexed[idnumber].nature)    
}

function doEditPlayer(){
  playerEdit2Player()
  editdialog.value = false
}

function doExportAll(){
  players.value.forEach((m)=> {
    m.nature = PLAYERSTATUS.requestedout
  })
  exportalldialog.value = false
}

function doExportPlayer(){
  console.log('doExportPlayer')
  playeredit.value.nature = PLAYERSTATUS.confirmedout
  let idclubvisit = parseInt(playeredit.value.idclubvisit) + 0
  console.log("idclubvisit", idclubvisit)
  playeredit.value.idclubvisit = idclubvisit
  console.log('playeredit', playeredit.value)
  playerEdit2Player()
  exportdialog.value = false
}

function fillinPlayerList() {
  console.log('fillingIn playerlist', props.members)
  if (props.members) {
    props.members.forEach((m) => {
      if (!playersindexed[m.idnumber]) {
        let newplayer = {
          assignedrating:  Math.max(m.fiderating, m.natrating),
          fiderating: m.fiderating,
          fullname: `${m.last_name}, ${m.first_name}`,
          first_name: m.first_name,
          idnumber: m.idnumber,
          idcluborig: m.idclub,
          idclubvisit: 0,
          last_name: m.last_name,
          natrating: m.natrating,
          nature: enrolled.value ? PLAYERSTATUS.assigned: PLAYERSTATUS.unassigned,
          titular: "",
          transfer: null,
        }
        players.value.push(newplayer)
        playersindexed[m.idnumber] = newplayer
      }
	  })
  }
  players.value.forEach((p) => {
    if (!p.fullname) {
      p.fullname = `${p.last_name}, ${p.first_name}`
    }
  })
}


function minelo(p) {
  let minrating = p.fiderating ? Math.min(p.fiderating, p.natrating) - 100 : p.natrating - 100
  return Math.max (minrating, 1000)
}

function openEditPlayer(idnumber) {
	playeredit.value = { ... playersindexed[idnumber]}
	editdialog.value = true
}

function openExportAll(){
  exportalldialog.value = true
}

function openExportPlayer(idnumber) {
	playeredit.value = { ... playersindexed[idnumber]}
  exportdialog.value = true
}

function playerEdit2Player(){
  // copy the data of Player Edit back to the Player
  // we splice the players array and add the playeredit to trigger a repaint of the table
  const aix = players.value.findIndex((p)=> p.idnumber == playeredit.value.idnumber)
  players.value.splice(aix, 1, playeredit.value)
  playersindexed[playeredit.value.idnumber] = players.value[aix]
}

function readICclub() {
  idclub.value = props.icclub.idclub
  enrolled.value = props.icclub.enrolled
	players.value = [...props.icclub.players]
	playersindexed = Object.fromEntries(players.value.map((x)=> [x.idnumber, x]))
	props.icclub.teams.forEach((t)=> {
		titularchoices.push({title: t.name, value: t.name })
	})
  fillinPlayerList()
}

function readMembers() {
  fillinPlayerList()
}

function rowstyle(idnumber){
  const pl = playersindexed[idnumber]
  if (!pl) return {}
  return {
    imported: pl.nature == "requestedin",
    exported: pl.nature == "confirmedout",
  }
}

async function savePlayerlist(){
  let reply
  try {
    emit('changeDialogCounter', 1)
		reply = await $backend("interclub","clb_setICclub", {
			token: idtoken.value,
			idclub: idclub.value,
			players: players.value,
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
	// emit('updateICclub')
}

function status(idnumber) {
  const pl = playersindexed[idnumber]
  return pl ? pl.idclubvisit : ""
}

async function validatePlayerlist(){
  if (!enrolled.value) {
    savePlayerlist()
    return
  }
  let reply
  try {
    emit('changeDialogCounter', 1)
		reply = await $backend("interclub","clb_validateICplayers", {
			token: idtoken.value,
			idclub: idclub.value,
			players: players.value,
		})
  } catch (error) {
    if (error.code == 401) gotoLogin()
    emit('displaySnackbar', t(error.message))
    return
  }
  finally {
    emit('changeDialogCounter',-1)
  }
  console.log('reply.data', reply.data)
  validationerrors.value = reply.data
  if (validationerrors.value.length) {
    validationdialog.value = true
  }
  else {
    savePlayerlist()
  }
   
}

 

defineExpose({ readICclub, readMembers })
</script>
<template>
	<v-container>
		<h2>{{ $t('Player list') }}</h2>
		<p v-if="!idclub">{{ $t('Please select a club to view the interclubs player list') }}</p>
		<div v-if="idclub">
      <div v-if="enrolled">
        {{ $t('This club is enrolled in Interclubs 2023-24') }}
      </div>
      <div v-else>
        {{ $t('This club is not enrolled in Interclubs 2023-24') }}
        <VBtn @click="openExportAll"  color="primary" class="ml-8">
          {{ $t('Export all players') }}
        </VBtn>
      </div>
      <VDataTable :items="players" :headers="headers"
        density="compact" 
        :items-per-page="itemsPerPage"
        :items-per-page-options="itemsPerPageOptions" 
        :sort-by="[{key: 'assignedrating', order: 'desc'}]"
      >
        <template v-slot:item.index="{ item, index }">
          <span :class="rowstyle(item.columns.idnumber)">
            {{ index + 1 }}
          </span>
        </template>
        <template v-slot:item.fullname="{ item }">
          <span :class="rowstyle(item.columns.idnumber)">
            {{ item.columns.fullname }}
          </span>
        </template>
        <template v-slot:item.idnumber="{ item }">
          <span :class="rowstyle(item.columns.idnumber)">
            {{ item.columns.idnumber }}
          </span>
        </template>
        <template v-slot:item.assignedrating="{ item }">
          <span :class="rowstyle(item.columns.idnumber)">
            {{ item.columns.assignedrating }}
          </span>
        </template>
        <template v-slot:item.idclub="{ item }">
          <span :class="rowstyle(item.columns.idnumber)">
            {{ item.columns.idclub }}
          </span>
        </template>
        <template v-slot:item.nature="{ item }">
          <span v-show="item.columns.nature == 'confirmedout'">
            <VIcon>mdi-arrow-right-bold</VIcon>{{ status(item.columns.idnumber) }}
          </span>
        </template>                         
        <template v-slot:item.action="{ item }">
          <VBtn density="compact" color="green" icon="mdi-pencil" variant="text"
            v-show="canEdit(item.columns.idnumber)" 
            @click="openEditPlayer(item.columns.idnumber)" 
          />
          <VBtn density="compact" color="red" icon="mdi-arrow-right" variant="text" 
            @click="openExportPlayer(item.columns.idnumber)" />
        </template>
      </VDataTable>
      <div>
        <VBtn @click="validatePlayerlist()" color="primary">{{ $t('Save') }}</VBtn>
      </div>
    </div>
		<VDialog v-model="editdialog"  width="20em">
			<VCard>
				<VCardTitle>
					{{ $t('Edit') }}: {{ playeredit.fullname }}
					<VDivider />
				</VCardTitle>
				<VCardText>
					<h4>Modify assigned Elo</h4>
					<div>Current assigned rating: {{ playeredit.assignedrating }} </div>
					<div>Max ELO: {{ Math.max(playeredit.fiderating, playeredit.natrating) + 100 }}</div>
					<div>Min ELO: {{ minelo(playeredit) }}</div>
					<div>BEL ELO: {{ playeredit.natrating }}</div>
					<div>FIDE ELO: {{ playeredit.fiderating }}</div>
					<VTextField v-model="playeredit.assignedrating" label="New Elo" />
					<VDivider />
					<h4>Titular</h4>
						<VSelect :items="titularchoices" v-model="playeredit.titular"></VSelect>
					<VDivider />
				</VCardText>
				<VCardActions>
					<VSpacer />
					<VBtn @click="doEditPlayer">{{ $t('OK') }}</VBtn>
					<VBtn @click="editdialog  = false">{{ $t('Cancel') }}</VBtn>
				</VCardActions>
			</VCard> 
		</VDialog>
    <VDialog v-model="exportdialog"  width="30em">
			<VCard>
				<VCardTitle>
					{{ $t('Export') }}: {{ playeredit.fullname }}
					<VDivider />
				</VCardTitle>
				<VCardText>
          <p>{{ $t('Exporting a player to another club')}}</p>
          <VTextField :label="$t('Club number')" v-model="playeredit.idclubvisit" />
				</VCardText>
				<VCardActions>
					<VSpacer />
					<VBtn @click="doExportPlayer">{{ $t('OK') }}</VBtn>
					<!-- <VBtn @click="undoExportPlayer">{{ $t('Undo export') }}</VBtn> -->
          <VBtn @click="exportdialog = false">{{ $t('Cancel') }}</VBtn>
				</VCardActions>
			</VCard> 
		</VDialog>
    <VDialog v-model="exportalldialog"  width="30em">
			<VCard>
				<VCardTitle>
					{{ $t('Export all players') }}
					<VDivider />
				</VCardTitle>
				<VCardText>
          <p>{{ $t('Exporting all players to another club')}}</p>
          <VTextField :label="$t('Club number')" :v-model="playeredit.idclubvisit" />
				</VCardText>
				<VCardActions>
					<VSpacer />
					<VBtn @click="doExportAll">{{ $t('OK') }}</VBtn>
					<VBtn @click="exportalldialog = false">{{ $t('Cancel') }}</VBtn>
				</VCardActions>
			</VCard> 
		</VDialog>    
		<VDialog v-model="validationdialog"  width="30em">
			<VCard>
				<VCardTitle>
					{{ $t('Validation of player list.')}}
					<VDivider />
				</VCardTitle>
				<VCardText class="markdowncontent">
					<div>{{ $t("The player list contains validation errors") }}</div>
          <ul>
            <li v-for="(err, ix) in validationerrors" :key="ix">
              <span v-show="err.errortype == 'ELO'">
                {{  t('Player') }} {{ err.detail  }}: {{  t(err.message) }}
              </span>
              <span v-show="err.errortype == 'TitularOrder'">
                {{  t(err.message) }}
              </span>
              <span v-show="err.errortype == 'TitularCount'">
                {{ err.detail  }}: {{  t(err.message) }}
              </span>            
            </li>
          </ul>
          <VDivider />
				</VCardText>
				<VCardActions>
					<VSpacer />
					<VBtn @click="savePlayerlist()">{{ $t('Save anyhow') }}</VBtn>
					<VBtn @click="validationdialog = false">{{ $t('Cancel') }}</VBtn>
				</VCardActions>
			</VCard> 
		</VDialog>    
  </v-container>
</template>

<style scoped>
.imported {
  color: purple;
  font-weight: bold;
}
.exported {
  color: lightgray;
}

</style>
