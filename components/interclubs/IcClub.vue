<script setup>
import {ref, computed, nextTick} from 'vue'
import Playerlistorder from './Playerlistorder.vue';
import { useIdtokenStore}  from '@/store/idtoken'
import { storeToRefs } from 'pinia'
const props = defineProps(["icclub", "members"])
const emit = defineEmits(['displaySnackbar', 'updateClub', 'changeDialogCounter'])
const { locale, t } = useI18n()
const { $backend } = useNuxtApp()
const idstore = useIdtokenStore()
const { token: idtoken } = storeToRefs(idstore)
const idclub = props.icclub.idclub

// playerlist
let playersindexed
const players = ref([])
const playeredit = ref({})
const playerdialog = ref(false)


// validation
const validatedialog = ref(false)
const validationerrors = []

// data table definiton
const headers = [
	{ title: 'Name', key: 'fullname' },
	{ title: "ID number", key: 'idnumber', sortable: false },
	{ title: "Assigned ELO", key: "assignedrating" },
	{ title: "Club", key: "idcluborig" },
	{ title: "Titular", key: "titular" },
	{ title: "Status", key: "nature"},
	{ title: "Action", key:"action" },
]
const itemsPerPage = 50
const itemsPerPageOptions = [
  {value: 50, title: '50'},
  {value: 150, title: '150'},
  {value: -1, title: 'All'}
]


const titularchoices = [{title: "#NA", value:""}]

function editPlayer(idnumber) {
	playeredit.value = playersindexed[idnumber]
	playerdialog.value = true
}

function readICclub() {
	console.log('reading icclub', props.icclub)
	players.value = [...props.icclub.players]
	playersindexed = Object.fromEntries(players.value.map((x)=> [x.idnumber, x]))
	props.icclub.teams.forEach((t)=> {
		titularchoices.push({title: t.name, value: t.name })
	})
}

function readMembers() {
	console.log('reading members', props.members)
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
				natrating: m.natrating,
				nature: "assigned",
				titular: "",
				transfer: null,
			}
			players.value.push(newplayer)
			playersindexed[m.idnumber] = newplayer
		}
	})
}

async function savePlayerlist(){
  let reply
	console.log('saving playerlist')
	let pl = players.value.map((p) =>  { return {
		assignedrating: p.assignedrating,
		idclubvisit: p.idclubvisit,
		nature: p.nature,
		titular: p.titular,
	}})
  try {
    emit('changeDialogCounter', 1)
		reply = await $backend("interclub","clb_setICclub", {
			token: idtoken.value,
			idclub: idclub,
			players: pl,
		})
  } catch (error) {
    if (error.code == 401) gotoLogin()
    emit('displaySnackbar', t(error.message))
    return
  }
  finally {
    emit('changeDialogCounter',-1)
  }
	emit('displaySnackbar', t('Playerlist saved'))
	emit('updateICclub')
}

function validatePlayerlist(){
	console.log('validating playerlist')
	validatedialog.value = true
}

defineExpose({ readICclub, readMembers })
</script>
<template>
	<v-container>
		<h2>{{ $t('Player list') }}</h2>
		<p v-if="!props.icclub.idclub">{{ $t('Please select a club to view the interclubs player list') }}</p>
		<div v-if="props.icclub.enrolled">
				{{ $t('This club is enrolled in Interclubs 2023-24') }}
				<VDataTable :items="players" :headers="headers" 
					density="compact" 
					:items-per-page="itemsPerPage"
					:items-per-page-options="itemsPerPageOptions" 
					:sort-by="[{key: 'assignedrating', order: 'desc'}]"
				>
					<template v-slot:item.action="{ item }">
						<VBtn density="compact" icon="mdi-pencil" variant="text" @click="editPlayer(item.columns.idnumber)" color="green"/>
					</template>
				</VDataTable>
		</div>
		<div v-else>
				Not enrolled
		</div>
		<div>
			<VBtn @click="validatePlayerlist()">{{ $t('Save player list') }}</VBtn>
		</div>
		<VDialog v-model="playerdialog"  width="40em">
			<VCard>
				<VCardTitle>
					Edit {{ playeredit.fullname }}
					<VDivider />
				</VCardTitle>
				<VCardText>
					<h4>Modify assigned Elo</h4>
					<div>Current assigned rating: {{ playeredit.assignedrating }} </div>
					<div>Max ELO: {{ Math.max(playeredit.fiderating, playeredit.natrating) + 100 }}</div>
					<div>Min ELO: {{ Math.min(playeredit.fiderating, playeredit.natrating) - 100 }}</div>
					<VTextField v-model="playeredit.assignedrating" label="New Elo" />
					<VDivider />
					<h4>Titular</h4>
						<VSelect :items="titularchoices" v-model="playeredit.titular"></VSelect>
					<h4>Transfer to other club</h4>
					<VDivider />
				</VCardText>
				<VCardActions>
					<VSpacer />
					<VBtn @click="playerdialog  = false">{{ $t('OK') }}</VBtn>
				</VCardActions>
			</VCard> 
		</VDialog>
		<VDialog v-model="validatedialog"  width="40em">
			<VCard>
				<VCardTitle>
					{{ $t('Validation of player list.')}}
					<VDivider />
				</VCardTitle>
				<VCardText>
					<h4>Titular</h4>
					<div>{{ $t("The titulars are assigned correctly") }}</div>
					<div>{{ $t("The are errors in titulars") }}</div>
					<VDivider />
					<h4>ELO</h4>
					<div>{{  $t('There are players with same assigned ELO') }}</div>		
					<div>{{  $t('There are no players with same assigned ELO') }}</div>		
					<VDivider />
				</VCardText>
				<VCardActions>
					<VSpacer />
					<VBtn @click="savePlayerlist()">{{ $t('Save anyhow') }}</VBtn>
					<VBtn @click="savePlayerlist()">{{ $t('Save') }}</VBtn>
					<VBtn @click="validatedialog = false">{{ $t('Cancel') }}</VBtn>
				</VCardActions>
			</VCard> 
		</VDialog>
	</v-container>
</template>