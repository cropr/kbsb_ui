<script setup>
import showdown from 'showdown'

const { locale } = useI18n()
const route = useRoute()
console.log('route', route)
const ttitle = `title_${locale.value}`
const tintro = `intro_${locale.value}`
const ttext = `text_${locale.value}`
const { data: article } = await useAsyncData(`article_${route.query.slug}`, 
  () => queryContent(`/articles/${route.query.slug}`).findOne())


const mdConverter = new showdown.Converter()
function md(s) { return mdConverter.makeHtml(s) }


</script>

<template>
  <v-container>
    <ContentRenderer :value="article">
      <h1 v-html="article[ttitle] ? article[ttitle] : article.title" />
      <div v-html="article[tintro]" class="my-2"/>
      <hr />
      <div v-html="md(article[ttext])" class="my-1 markdowncontent" />
    </ContentRenderer>
  </v-container>
</template>

