<script setup>
import { ref, computed, onMounted } from 'vue'
import { EMPTY_CLUB } from '@/util/club'

const { locale } = useI18n()
const { $backend } = useNuxtApp()
const boardmembers = ref({})
const club = ref({...EMPTY_CLUB})
const clubs = ref([])

const idclub = ref(null)

async function get_clubs() {
  try {
    const reply = await $backend("club", "anon_get_clubs", {})
    console.log('reply', reply)
    clubs.value = reply.data.clubs;
    clubs.value.forEach((p) => {
      p.merged = `${p.idclub}: ${p.name_short} ${p.name_long}`;
    });
  } catch (error) {
    const reply = error.response;
    console.error("Getting clubs failed", reply);
    // this.$root.$emit("snackbar", {
    //   text: "Getting clubs failed",
    // });
  }
}

function selectclub() {
  console.log('idclub selected', idclub) 
  if (!idclub.value) {
    club.value = {};
  } else {
    clubs.value.forEach((c) => {
      console.log('club iter', c)
      if (c.idclub == idclub.value) {
        club.value = { ...EMPTY_CLUB, ...c };
      }
    });
  }
}

onMounted(()=>(get_clubs()))

</script>

<template>
  <v-container>
    <h1>{{ $t("Club details") }}</h1>
    <v-card class="mt-2">
      <v-card-text>
        <p v-if="!club.idclub">{{ $t("Select a club to view the club details") }}</p>
        <VAutocomplete v-model="idclub" :items="clubs" 
          item-title="merged" item-value="idclub" color="green"
          label="Club" clearable @update:model-value="selectclub" >

        </VAutocomplete>
      </v-card-text>
    </v-card>

    <div v-if="club.idclub" class="mt-3">
      <v-row>
        <v-col cols="12" md="6">
          <h4>{{ $t("Details") }}</h4>
          <div>
            <span class="fieldname">{{ $t("Long name") }}</span>: {{ club.name_long }}
          </div>
          <div>
            <span class="fieldname">{{ $t("Short name") }}</span>: {{ club.name_short }}
          </div>
          <div>
            <span class="fieldname">{{ $t("Club venue") }}</span>:<br />
            <span v-html="club.venue.replaceAll('\n', '<br />')"></span>
          </div>
          <h4 class="mt-2">{{ $t("Contact") }}</h4>
          <div>
            <span class="fieldname">{{ $t("Main email address") }}</span>: {{ club.email_main }}
          </div>
          <div>
            <span class="fieldname">{{ $t("Postal address") }}</span>:<br />
            <span v-html="club.address.replaceAll('\n', '<br />')"></span>
          </div>
          <div>
            <span class="fieldname">{{ $t("Website") }}</span>: <a :href="club.website" target="_blank">{{ club.website
            }}</a>
          </div>
        </v-col>

        <v-col cols="12" sm="6" lg="4">
          <h4>{{ $t("Board members") }}</h4>
          <ul>
            <li v-for="(bm, f) in club.boardmembers" :key="f">
              <tr-fieldname :fieldname="f" />: {{ bm.first_name }} {{ bm.last_name}}<br />
              <span v-show="bm.email && bm.email != '#NA'">e-mail: {{ bm.email }}<br /></span>
              <span v-show="bm.mobile && bm.mobile != '#NA'">gsm: {{ bm.mobile }}<br /></span>
            </li>
          </ul>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<style scoped>
.fieldname {
  color: green;
}
</style>
