<template>
  <v-container>
    <p v-if="!club.idclub">Please select a club to view the enrollment</p>
    <div v-if="club.idclub">
      <v-container v-show="status_consulting">
        <v-row v-show="!enrollment.id">
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Enrollment
              </v-card-title>
              <v-card-text>
                The club is not enrolled yet
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-show="enrollment.id">
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                {{ $t("Teams") }}
              </v-card-title>
              <v-card-text>
                <ul>
                  <li>Teams in division 1: {{ enrollment.teams1 }}</li>
                  <li>Teams in division 2: {{ enrollment.teams2 }}</li>
                  <li>Teams in division 3: {{ enrollment.teams3 }}</li>
                  <li>Teams in division 4: {{ enrollment.teams4 }}</li>
                  <li>Teams in division 5: {{ enrollment.teams5 }}</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                {{ $t("Wishes") }}
              </v-card-title>
              <v-card-text>
                <ul>
                  <li>Teams grouped by pairing number: {{ groupingvalue }} </li>
                  <li>Distribution of teams in same division: {{ splittingvalue }} </li>
                  <li>Regional preferences: {{ enrollment.wishes.regional }} </li>
                  <li>Remarks: {{ enrollment.wishes.remarks }} </li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Name
              </v-card-title>
              <v-card-text>
                Name of the club as shown in results and pairings: {{ enrollment.name }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-btn @click="modifyEnrollment" :disabled="new Date() > stopdate">
            Edit
          </v-btn>
        </v-row>
      </v-container>
      <v-container v-show="status_modifying">
        <v-row>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Teams
              </v-card-title>
              <v-card-text>
                <v-text-field v-model="enrollment.teams1" :label="$t('Teams in division') + ' 1'"
                  type="number" min="0" max="1" />
                <v-text-field v-model="enrollment.teams2" :label="$t('Teams in division') + ' 2'"
                  type="number" min="0" max="15" />
                <v-text-field v-model="enrollment.teams3" :label="$t('Teams in division') + ' 3'"
                  type="number" min="0" max="15" />
                <v-text-field v-model="enrollment.teams4" :label="$t('Teams in division') + ' 4'"
                  type="number" min="0" max="15" />
                <v-text-field v-model="enrollment.teams5" :label="$t('Teams in division') + ' 5'"
                  type="number" min="0" max="15" />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Wishes
              </v-card-title>
              <v-card-text>
                <v-select :label="$t('Teams grouped by pairing number')"
                  v-model="enrollment.wishes.grouping" :items="grouping" />
                <v-select :label="$t('Distribution of teams in same division')"
                  v-model="enrollment.wishes.split" :items="splitting" />
                <v-text-field v-model="enrollment.wishes.regional"
                  :label="$t('Regional preferences')" /> 
                <v-textarea rows="5" v-model="enrollment.wishes.remarks" :label="$t('Remarks')" />
              </v-card-text>                                                     
            </v-card>            
          </v-col>
          <v-col cols="12" sm="6" md="4" xl="3">
            <v-card class="elevation-5">
              <v-card-title class="card-title">
                Name
              </v-card-title>
              <v-card-text>
                You can define a name for your club when the results and standings are displayed.
                As a default, you clubname is used.
                <v-text-field v-model="enrollment.name" :label="$t('Name')" />
              </v-card-text>                                                     
            </v-card>            
          </v-col>
        </v-row>
        <v-row>
          <v-btn @click="saveEnrollment">
            Save
          </v-btn>&nbsp;
          <v-btn @click="cancelEnrollment">
            Cancel
          </v-btn>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>
<script>
import { INTERCLUBS_STATUS, STOPDATE, empty_enrollment } from '@/util/interclubs.js'

export default {

  name: 'Enrollment',

  data() {
    return {
      grouping: [
        { "text": "No preference", "value": "0" },
        { "text": "1 group", "value": "1" },
        { "text": "2 opposite groups", "value": "2" },
      ],
      splitting: [
        { "text": "In 1 series", "value": "1" },
        { "text": "In multiple series", "value": "2" },
      ],
      enrollment: empty_enrollment,
      status: INTERCLUBS_STATUS.CONSULTING,
      stopdate: STOPDATE,
    }
  },

  props: {
    club: Object
  },

  computed: {
    logintoken() { return this.$store.state.newlogin.value },
    groupingvalue() {
      const gr = this.grouping.filter(x => x.value == this.enrollment.wishes.grouping)
      return gr.length > 0 ? gr[0].text : ""
    },
    splittingvalue() {
      const spl = this.splitting.filter(x => x.value == this.enrollment.wishes.split)
      return spl.length > 0 ? spl[0].text : ""
    },
    status_consulting() { return this.status == INTERCLUBS_STATUS.CONSULTING },
    status_modifying() { return this.status == INTERCLUBS_STATUS.MODIFYING },
  },

  methods: {

    cancelEnrollment() {
      this.status = INTERCLUBS_STATUS.CONSULTING
      this.find_interclubenrollment()
    },

    async find_interclubenrollment() {
      if (!this.club.id) {
        this.enrollment = empty_enrollment
        return
      }
      this.enrollment = { ... empty_enrollment}
      try {
        const reply = await this.$api.interclub.find_interclubenrollment({
          idclub: this.club.idclub
        })
        if (reply.data) {
          this.enrollment = reply.data
        }
        else {
          this.enrollment.id = null
        }
      } catch (error) {
        const reply = error.response
        if (reply.status === 401) {
          this.gotoLogin()
        }
        else {
          console.error('Getting existing enrollment failed', reply.data.detail)
          this.$root.$emit('snackbar', { text: 'Getting existing enrollment failed' })
        }
      }
    },

    async modifyEnrollment() {
      this.status = INTERCLUBS_STATUS.MODIFYING
      this.enrollment.name = this.club.name_long
    },

    async saveEnrollment() {
      try {
        const reply1 = await this.$api.interclub.mgmt_set_interclubenrollment({
          token: this.logintoken,
          idclub: this.club.idclub,
          teams1: this.enrollment.teams1,
          teams2: this.enrollment.teams2,
          teams3: this.enrollment.teams3,
          teams4: this.enrollment.teams4,
          teams5: this.enrollment.teams5,
          wishes: this.enrollment.wishes,
        })
        this.status = INTERCLUBS_STATUS.CONSULTING
        this.find_interclubenrollment(this.club)
      } catch (error) {
        const reply = error.response
        console.error('Saving enrollment', reply.data.detail)
        this.$root.$emit('snackbar', { text: 'Saving enrollment' })
      }
    },

    async setupEnrollment(){
      await this.find_interclubenrollment()
    },

  },



}
</script>