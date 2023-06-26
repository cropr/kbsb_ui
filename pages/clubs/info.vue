<template>
  <v-container>
    <h1>{{ $t("Club details") }}</h1>
    <v-card class="mt-2">
      <v-card-text>
        <p v-if="!club.idclub">{{ $t("Select a club to view the club details") }}</p>
        <v-autocomplete
          v-model="idclub"
          :items="clubs"
          item-text="merged"
          item-value="idclub"
          color="deep-purple"
          label="Club"
          clearable
          @change="selectclub"
        >
          <template v-slot:item="data">
            {{ data.item.merged }}
          </template>
        </v-autocomplete>
      </v-card-text>
    </v-card>

    <div v-if="club.idclub" class="mt-3">
      <v-row>
        <v-col cols="12" md="6">
          <h4>{{ $t("Details") }}</h4>
          <div>
            <span class="fieldname">{{ $t("Long name") }}</span
            >: {{ club.name_long }}
          </div>
          <div>
            <span class="fieldname">{{ $t("Short name") }}</span
            >: {{ club.name_short }}
          </div>
          <div>
            <span class="fieldname">{{ $t("Club venue") }}</span
            >:<br />
            <span v-html="club.venue.replaceAll('\n', '<br />')"></span>
          </div>
          <h4 class="mt-2">{{ $t("Contact") }}</h4>
          <div>
            <span class="fieldname">{{ $t("Main email address") }}</span
            >: {{ club.email_main }}
          </div>
          <div>
            <span class="fieldname">{{ $t("Postal address") }}</span
            >:<br />
            <span v-html="club.address.replaceAll('\n', '<br />')"></span>
          </div>
          <div>
            <span class="fieldname">{{ $t("Website") }}</span
            >: <a :href="club.website" target="_blank">{{ club.website }}</a>
          </div>
        </v-col>

        <v-col cols="12" sm="6" lg="4">
          <h4>{{ $t("Board members") }}</h4>
          <ul>
            <li v-for="(bm, f) in club.boardmembers" :key="f">
              <span class="fieldname">{{ boardroles[f][$i18n.locale] }}</span
              >: {{ bm.first_name }} {{ bm.last_name }}<br />
              email: {{ bm.email }}<br />
              gsm: {{ bm.mobile }}
            </li>
          </ul>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>

const EMPTY_club = {
  venue: "",
  address: "",
};

export default {
  name: "Details",

  data() {
    return {
      boardroles: [],
      boardmembers: {},
      club: {...EMPTY_club},
      clubs: [],
      idclub: null,
    };
  },

  async fetch() {
    this.boardroles = (await this.$content("boardroles").fetch()).boardroles;
  },

  methods: {
    async get_clubs() {
      try {
        const reply = await this.$api.club.anon_get_clubs();
        this.clubs = reply.data.clubs;
        this.clubs.forEach((p) => {
          p.merged = `${p.idclub}: ${p.name_short} ${p.name_long}`;
        });
      } catch (error) {
        const reply = error.response;
        console.error("Getting clubs failed", reply.data.detail);
        this.$root.$emit("snackbar", {
          text: "Getting clubs failed",
        });
      }
    },


    selectclub() {
      if (!this.idclub) {
        this.club = {};
      } else {
        this.clubs.forEach((c) => {
          if (c.idclub == this.idclub) {
            this.club = {...EMPTY_club, ...c};
          }
        });
      }
    },
  },

  mounted() {
    this.get_clubs()
  },
};
</script>

<style scoped>
.fieldname {
  color: green;
}
</style>
