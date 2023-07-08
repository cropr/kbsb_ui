<template>
  <v-container>
    <h2>{{ pagetitle }}</h2>
    <div class="mt-1" v-html="pagecontent" />
  </v-container>
</template>

<script>

import showdown from 'showdown'

export default {

  name: 'Enrollment',

  data(){
    return{
      page: {}
    }
  }, 

  async fetch () {
    this.page = await this.$content('pages', 'interclubs-announcements').fetch()
  },

  computed: {
    pagecontent () {
      const pcontent = this.page[`content_${this.$i18n.locale}`]
      const converter = new showdown.Converter()
      return converter.makeHtml(pcontent)
    },

    pagetitle () {
      const locale = this.$i18n.locale
      const pti18 = this.page[`title_${locale}`]
      const ptitle = pti18 && pti18.length ? pti18 : this.page.title
      return ptitle
    }
  }

}
</script>