<template>
  <v-container>
    <p>Management FRBE KBSB KSB</p>
    <p>
      This part of the site is only accessible for people with a valid
      @frbe-kbsb-ksb.be email address
    </p>
    <div id="parent_id" />
  </v-container>
</template>

<script>

import * as jose from 'jose'

export default {
  layout: 'mgmt',

  data () {
    return {
      wrong_domain: false
    }
  },

  head: {
    title: 'Management Login',
    script: [
      {
        src: 'https://accounts.google.com/gsi/client',
        defer: true
      }
    ]
  },

  computed: {
    person () { return this.$store.state.person }
  },

  mounted () {
    this.checkAuth()
    this.setupGoogle()
  },

  methods: {

    handleGoogle (resp) {
      this.wrong_domain = false
      const payload = jose.decodeJwt(resp.credential)
      console.log('decoded', payload)
      this.$store.commit('person/updateUser', {
        credential: resp.credential,
        user: payload.given_name,
        email: payload.email
      })
      this.checkAuth()
    },

    setupGoogle () {
      console.log('Setup google sign in')
      // eslint-disable-next-line no-undef
      google.accounts.id.initialize({
        client_id: '658290412135-v6ah768urdv83dn76ra4mkiovdalal2k.apps.googleusercontent.com',
        callback: this.handleGoogle,
        prompt_parent_id: 'parent_id'
      })
      // eslint-disable-next-line no-undef
      google.accounts.id.prompt()
    },

    checkAuth () {
      console.log('checking if auth is present so we can go to overview')
      if (this.person.credential.length > 0) {
        if (this.person.email.endsWith('@frbe-kbsb-ksb.be')) {
          this.$router.push('/mgmt/overview')
        } else {
          this.wrong_domain = true
        }
      }
    }
  }

}
</script>
