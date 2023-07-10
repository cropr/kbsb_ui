<template>
  <v-container>
    <h1>Overview Management FRBE KBSB KSB</h1>
    <p>Here you can add, modify or delete the content of pages and news articles</p>
    <p>
      For the upload of reports of meetings and other files, we still use the old
      interface at
      <a href="/mgmt/filelist">Files (Reports)</a>
    </p>
    <p>
      Documentaion about thi swebsite can be found at 
      <a href="https://sites.google.com/frbe-kbsb-ksb.be/internal/home">Internal site</a>
    </p>
    <P>Modifying the website is done in 3 steps:</P>
    <ul>
      <li>Managing of the <NuxtLink to="/mgmt/content">Content</NuxtLink> (news articles and pages)</li>
      <li>Admin part of <NuxtLink to="/mgmt/clubs">Clubs Manager</NuxtLink></li>
      <li>Admin part of <NuxtLink to="/mgmt/interclubs">Interclubs Manager</NuxtLink></li>
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

  name: 'MgmtOverview',

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

    openCollections () {
      const stUrl = this.$config.statamic_url
      window.open(`${stUrl}/cp/collections`, '_statamic')
    },

    async checkin () {
      this.checkinlaunched = true
      const data = {
        user: this.person.user,
        email: this.person.email,
        branch: this.$config.repo_branch,
      }
      const reply = await fetch(this.$config.statamic_url + '/python/checkin', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('reply', reply)
      this.checkinlaunched = false
      this.checkinsuccess = true
    },

    async checkout () {
      this.checkoutlaunched = true
      const data = {
        user: this.person.user,
        email: this.person.email,
        branch: this.$config.repo_branch,
      }
      const reply = await fetch(this.$config.statamic_url + '/python/checkout', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('reply', reply)
      this.checkoutlaunched = false
      this.checkoutsuccess = true
    }

  }
}
</script>
