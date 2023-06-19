<template>
  <v-container>
    <h1>Logout</h1>
    <p>You have been logged out</p>
  </v-container>
</template>

<script>

export default {
  layout: 'mgmt',

  name: "MgmtLogout",

  head: {
    title: 'Logout'
  },

  mounted (){
    this.$store.commit('newlogin/update', null)
  }

}
</script>

<style>

</style>
