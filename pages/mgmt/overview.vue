<template>
  <v-container>
    <h1>Overview Management FRBE KBSB KSB</h1>
    <p>The following admin interfaces are available</p>
    <ul>
      <li>Managing of the <NuxtLink to="/mgmt/content">Content</NuxtLink> (news articles and pages)</li>
      <li>Admin part of <NuxtLink to="/mgmt/clubs">Clubs Manager</NuxtLink></li>
      <li>Admin part of <NuxtLink to="/mgmt/clubs">Interclubs Manager</NuxtLink></li>
      <li>Managing of <NuxtLink to="/mgmt/filelist">Files</NuxtLink> (reports and other assets)</li>
    </ul>
    <p>
      Documentaion about the management of the website can be found at 
      <a href="https://sites.google.com/frbe-kbsb-ksb.be/internal/home">Internal site</a>
    </p>
  </v-container>
</template>

<script>
export default {
  layout: 'mgmt',

  nam: 'Overview',

  head: {
    title: 'Management Overview',

    // we need google script to load because we might redirect internally
    // to index in case we fail the authentication
    script: [
      {
        src: 'https://accounts.google.com/gsi/client',
        async: true,
        defer: true
      }
    ]
  },

  computed: {
    person () {
      return this.$store.state.person
    }
  },

  mounted () {
    this.checkAuth()
  },

  methods: {

    checkAuth () {
      if (this.person.credential.length === 0) {
        this.$router.push('/mgmt')
      }
      if (!this.person.email.endsWith('@frbe-kbsb-ksb.be')) {
        this.$router.push('/mgmt')
      }
    },

  }
}
</script>
