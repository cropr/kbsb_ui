<template>
  <v-container>
    <h1 class="text-h4 text-md-h3">{{ pagetitle }}</h1>
    <div class="mt-1" v-html="pageintro" />
    <div class="mt-1" v-html="pagecontent" />
  </v-container>
</template>

<script>

import showdown from 'showdown'
import TheSidebar from '../components/TheSidebar.vue'

export default {

  name: 'Article',

  layout: 'default',

  data () {
    return {
      articles: []
    }
  },

  async fetch () {
    this.articles = await this.$content('articles').fetch()
  },

  head: {
    title: 'Article'
  },

  computed: {

    page () {
      let page = null
      this.articles.forEach((a) => {
        if (a.slug == this.$route.query.slug) {
          page = a
        }
      })
      return page
    },

    pagecontent () {
      if (!this.page) return ""
      const pcontent = this.page[`text_${this.$i18n.locale}`]
      const converter = new showdown.Converter()
      return converter.makeHtml(pcontent)
    },

    pageintro () {
      if (!this.page) return ""
      const pint18 = this.page[`intro_${this.$i18n.locale}`]
      const pintro = pint18 && pint18.length ? pint18 : this.page.intro
      const converter = new showdown.Converter()
      return converter.makeHtml(pintro)
    },

    pagetitle () {
      if (!this.page) return ""
      const locale = this.$i18n.locale
      const pti18 = this.page[`title_${locale}`]
      const ptitle = pti18 && pti18.length ? pti18 : this.page.title
      return ptitle
    }

  },

  mounted () {
    console.log('mounted', this.$route.query.slug )
  }

}
</script>

<style>
h1:after {
  content: ' ';
  display: block;
  border: 1px solid #aaa;
  margin-bottom: 1em;
}

.nuxt-content td,
.nuxt-content th {
  padding: 8px;
  border: 1px solid #ddd;
}

.nuxt-content table {
  border-collapse: collapse;
}

.nuxt-content ul,
.nuxt-content ol,
.nuxt-content h2,
.nuxt-content h3 {
  margin-bottom: 0.5em;
}
</style>
