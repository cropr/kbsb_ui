<template>
  <v-dialog v-model="dialog" width="20em">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="green" fab outlined x-small v-bind="attrs" v-on="on">
        <v-icon>mdi-help</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title>{{ pagetitle }}
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pt-3" v-html="pagecontent"> 
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>

import showdown from 'showdown'

export default {
  data() {
    return {
      dialog: false,
      page: {},
    }
  },

  async fetch() {
    const f = `help-${this.file}`
    console.log("f", f)
    this.page = (await this.$content('pages', f).fetch())
    console.log('page', this.page)
  },

  props: {
    file: String
  },

  computed: {
    
    pagecontent () {
      const pcontent = this.page[`content_${this.$i18n.locale}`] || "Nothing"
      const converter = new showdown.Converter()
      return converter.makeHtml(pcontent)
    },

    pagetitle () {
      const locale = this.$i18n.locale
      const pti18 = this.page[`title_${locale}`] || "Nothing"
      const ptitle = pti18 && pti18.length ? pti18 : this.page.title
      return ptitle
    }
  }

}
</script>