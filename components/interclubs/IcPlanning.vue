<script setup>
import { ref } from 'vue'
import { useIdtokenStore}  from '@/store/idtoken'
import { storeToRefs } from 'pinia'

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

// playerlist
let playersindexed = {}
const players = ref([])

//icseries
const icseries = ref({})

// validation
const validationdialog = ref(false)
const validationerrors = ref([])


// methods alphabetically
async function readICclub(){
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
  idclub.value = props.icclub.idclub
  readICSeries()
}

async function readICSeries() {
  let reply
  idclub.value = props.icclub.idclub
  if (!idclub.value) return
  emit('changeDialogCounter', 1)
  try {
    reply = await $backend("club", "anon_getICSeries", {
      round: round.value,
      idclub: idclub.value,
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
  icseries.value = reply.data
}

async function savePlanning(){
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

async function validatePlanning(){
  let reply
  try {
    emit('changeDialogCounter', 1)
		reply = await $backend("interclub","clb_validateICplanning", {
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
    savePlanning()
  }
   
}

 
</script>
<template>
	<v-container>
		<h2>{{ $t('Planning Interclubs list') }}</h2>
    <div v-if="!idclub">
      <v-alert  type="warning" variant="outlined" closable 
        :text="t('Please select a club to view the interclubs player list')"/>
    </div>
		<div v-if="idclub && accessdenied">
      <v-alert type="error" variant="outlined" closable 
        :text="t('Permission denied')" />
    </div> 
    <div v-if="icclub.idclub && !accessdenied">     
      <v-row>
        <v-col cols="8" sm="5">
          <VSelect v-model="round" :items="ic_rounds" :label="t('Round')">
          </VSelect>
        </v-col>
        <v-col cols="4" sm="2">
          <VBtn icon="mdi-play" @click="getPlanning"></VBtn>
        </v-col>
      </v-row>
      <div>
        <VBtn @click="validatePlayerlist()" color="primary" :disabled="expired">{{ $t('Save') }}</VBtn>
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

</style>
