<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMgmtTokenStore } from "@/store/mgmttoken";
import { PLAYERSTATUS } from "@/util/interclubs"

// communication with manager
const emit = defineEmits(['displaySnackbar',  'changeDialogCounter'])
defineExpose({ setup })

// idtoken
const mgmtstore = useMgmtTokenStore()
const {token: mgmttoken} = storeToRefs(mgmtstore) 

const { $backend } = useNuxtApp()

// datamodel
const clubmembers = ref([])
const clubmembers_id = ref(null)
const icclub = ref({})
const idclub = ref(0) 
const enrolled = ref(null)
let playersindexed = {}
const players = ref([])
const playeredit = ref({})
const editdialog = ref(false)
const exportalldialog = ref(false)
const exportallvisit = ref(0)
const exportdialog = ref(false)
const titularchoices = [{title: "No titular", value:""}]

// validation
const validationdialog = ref(false)
const validationerrors = ref([])

// data table definiton
const headers = [
  { title: "N", key: "index"},
	{ title: "Name", key: 'fullname' },
	{ title: "ID number", key: 'idnumber', sortable: false },
	{ title: "ELO", key: "assignedrating" },
	{ title: "F-ELO", key: "fiderating" },
	{ title: "B-ELO", key: "natrating" },  
	{ title: "Club", key: "idcluborig" },
	{ title: "Titular", key: "titular" },
	{ title: "Status", key: "nature"},
	{ title: "Actions", key:"action" },
]
const itemsPerPage = 50
const itemsPerPageOptions = [
  {value: 50, title: '50'},
  {value: 150, title: '150'},
  {value: -1, title: 'All'}
]

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
    m.nature = PLAYERSTATUS.confirmedout
    m.idclubvisit = parseInt(exportallvisit.value) + 0
  })
  exportalldialog.value = false
}

function doExportPlayer(){
  playeredit.value.nature = PLAYERSTATUS.confirmedout
  playeredit.value.idclubvisit = parseInt(playeredit.value.idclubvisit) + 0
  playerEdit2Player()
  exportdialog.value = false
}

function fillinPlayerList() {
  clubmembers.value.forEach((m) => {
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
  players.value.forEach((p) => {
    if (!p.fullname) {
      p.fullname = `${p.last_name}, ${p.first_name}`
    }
  })
}

async function getClubMembers() {
  // get club members for member database currently on old site
  if (!idclub.value) {
    clubmembers.value = []
    return
  }
  if (idclub.value == clubmembers_id.value) return  // it is already read in
  emit('changeDialogCounter',1)
  let reply
  clubmembers.value = []
  try {
    reply = await $backend("member", "anon_getclubmembers", {
      idclub: idclub.value,
    })
  } catch (error) {    
    console.log('getClubMembers error')
    displaySnackbar(t(error.message))
    return
  } finally {
    emit('changeDialogCounter', -1)
  }
  clubmembers_id.value = idclub.value
  const members = reply.data
  members.forEach(p => {
    p.merged = `${p.idnumber}: ${p.first_name} ${p.last_name}`
  })
  clubmembers.value = members.sort((a, b) =>
    (a.last_name > b.last_name ? 1 : -1))
  fillinPlayerList()  
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
  idclub.value = icclub.value.idclub
  enrolled.value = icclub.value.enrolled
	players.value = icclub.value.players ? [...icclub.value.players] : []
	playersindexed = Object.fromEntries(players.value.map((x)=> [x.idnumber, x]))
  titularchoices.splice(1,titularchoices.length-1)
  if (icclub.value.teams) {
    icclub.value.teams.forEach((t)=> {
      titularchoices.push({title: t.name, value: t.name })
    })
  }
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
		reply = await $backend("interclub","mgmt_setICclub", {
			token: mgmttoken.value,
			idclub: idclub.value,
			players: players.value,
		})
  } catch (error) {
    emit('displaySnackbar', error.message)
    return
  }
  finally {
    emit('changeDialogCounter',-1)
  }
  validationdialog.value = false
	emit('displaySnackbar', 'Playerlist saved')
}

function status(idnumber) {
  const pl = playersindexed[idnumber]
  return pl ? pl.idclubvisit : ""
}

function setup(clb, mbrs){
  console.log('setup playerlist', clb)
  icclub.value = clb
  readICclub()
  getClubMembers()
} 

async function validatePlayerlist(){
  if (!enrolled.value) {
    savePlayerlist()
    return
  }
  let reply
  try {
    emit('changeDialogCounter', 1)
		reply = await $backend("interclub","mgmt_validateICplayers", {
			token: mgmttoken.value,
			idclub: idclub.value,
			players: players.value,
		})
  } catch (error) {
    emit('displaySnackbar', error.message)
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

</script>
<template>
	<v-container>
		<h2>Player list</h2>
		<p v-if="!idclub">Please select a club to view the interclubs player list</p>
		<div v-if="idclub">
      <div v-if="enrolled">
        This club is enrolled in Interclubs 2023-24
      </div>
      <div v-else>
        This club is not enrolled in Interclubs 2023-24
        <VBtn @click="openExportAll"  color="primary" class="ml-8">
          Export all players
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
        <VBtn @click="validatePlayerlist()" color="primary">Save</VBtn>
      </div>
    </div>
		<VDialog v-model="editdialog"  width="20em">
			<VCard>
				<VCardTitle>
					Edit: {{ playeredit.fullname }}
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
					<VBtn @click="doEditPlayer">OK</VBtn>
					<VBtn @click="editdialog  = false">Cancel</VBtn>
				</VCardActions>
			</VCard> 
		</VDialog>
    <VDialog v-model="exportdialog"  width="30em">
			<VCard>
				<VCardTitle>
					Export: {{ playeredit.fullname }}
					<VDivider />
				</VCardTitle>
				<VCardText>
          <p>Exporting a player to another club</p>
          <VTextField label="Club number" v-model="playeredit.idclubvisit" />
				</VCardText>
				<VCardActions>
					<VSpacer />
					<VBtn @click="doExportPlayer">OK</VBtn>
					<!-- <VBtn @click="undoExportPlayer">Undo export</VBtn> -->
          <VBtn @click="exportdialog = false">Cancel</VBtn>
				</VCardActions>
			</VCard> 
		</VDialog>
    <VDialog v-model="exportalldialog"  width="30em">
			<VCard>
				<VCardTitle>
					Export all players
					<VDivider />
				</VCardTitle>
				<VCardText>
          <p>Exporting all players to another club</p>
          <VTextField label="Club number" v-model="exportallvisit" />
				</VCardText>
				<VCardActions>
					<VSpacer />
					<VBtn @click="doExportAll">OK</VBtn>
					<VBtn @click="exportalldialog = false">Cancel</VBtn>
				</VCardActions>
			</VCard> 
		</VDialog>    
		<VDialog v-model="validationdialog"  width="30em">
			<VCard>
				<VCardTitle>
					Validation of player list.
					<VDivider />
				</VCardTitle>
				<VCardText class="markdowncontent">
					<div>The player list contains validation errors</div>
          <ul>
            <li v-for="(err, ix) in validationerrors" :key="ix">
              <span v-show="err.errortype == 'ELO'">
                Player {{ err.detail  }}: {{  err.message }}
              </span>
              <span v-show="err.errortype == 'TitularOrder'">
                {{  err.message }}
              </span>
              <span v-show="err.errortype == 'TitularCount'">
                {{ err.detail  }}: {{  err.message }}
              </span>            
            </li>
          </ul>
          <VDivider />
				</VCardText>
				<VCardActions>
					<VSpacer />
					<VBtn @click="savePlayerlist()">Save anyhow</VBtn>
					<VBtn @click="validationdialog = false">Cancel</VBtn>
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

</style>
