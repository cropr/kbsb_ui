<template>
  <v-container>
    <h1>Management Files</h1>
    <v-data-table :headers="headers" :items="files" :footer-props="footerProps" class="elevation-1"
      :sort-by="['name']">
      <template #top>
        <v-toolbar flat color="white">
          <v-toolbar-title>
            Files
          </v-toolbar-title>
          <v-spacer />
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn fab outlined color="deep-purple" v-on="on" @click="addFile()">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
            <span>Add File</span>
          </v-tooltip>
        </v-toolbar>
      </template>
      <template #item.action="{ item }">
        <v-icon small class="mr-2" @click="editFile(item)">
          mdi-pencil
        </v-icon>
      </template>
      <template #item.topic_ts="{ item }">
        {{ item.topic_ts }}
      </template>
      <template #no-data>
        No files yet.
      </template>
    </v-data-table>
  </v-container>
</template>

<script>

export default {

  name: 'Filelist',

  layout: 'mgmt',

  head: {
    title: 'Management Files',
    script: [
      {
        src: 'https://accounts.google.com/gsi/client',
        defer: true
      }
    ]
  },

  data() {
    return {
      headers: [
        {
          text: 'Name', value: 'name'
        },
        {
          text: 'Topic', value: 'topic'
        },
        {
          text: 'Topic timestamp', value: 'topicdate'
        },
        {
          text: 'Actions', value: 'action', sortable: false
        }
      ],
      files: [],
      footerProps: {
        itemsPerPageOptions: [20, 50, -1],
        itemsPerPage: 20
      }
    }
  },

  computed: {
    token() { return this.$store.state.newlogin.value },
    person() {
      return this.$store.state.person
    },
  },

  async mounted() {
    await this.checkAuth()
    await this.getFiles()
  },

  methods: {

    addFile() {
      this.$router.push('/mgmt/fileadd')
    },

    async checkAuth() {
      console.log('checking if auth is already set')
      if (!this.logintoken) {
        if (this.person.credential.length === 0) {
          this.$router.push('/mgmt')
        }
        if (!this.person.email.endsWith('@frbe-kbsb-ksb.be')) {
          this.$router.push('/mgmt')
        }
        // now login using the Google auth token
        await this.$api.root.login({
          logintype: 'google',
          token: this.person.credential
        }).then(
          (resp) => {
            this.$store.commit('newlogin/update', resp.data)
          },
          (error) => {
            const resp = error.response
            console.log('failed login', resp.data.detail)
            this.$router.push('/mgmt')
          }
        )
      }
    },

    editFile(item) {
      this.$router.push('/mgmt/fileedit/?id=' + item.id)
    },

    async getFiles() {
      console.log('getting files')
      try {
        const resp = await this.$api.file.get_files({
          token: this.token
        })
        this.files = resp.data.files
      } catch (error) {
        console.error("error", error)
        const resp = error.response
        console.error('getting getFiles', resp)
        this.$root.$emit('snackbar', { text: 'Getting files failed', reason: resp.data.detail })
      }
    }

  }

}
</script>
