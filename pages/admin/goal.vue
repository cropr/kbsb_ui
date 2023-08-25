<script setup>
import showdown from 'showdown'
const { locale } = useI18n()
console.log('locale', locale)
const ttitle = `title_${locale}`
const { data }  = await useAsyncData('index', () => queryContent('/pages/goal').findOne())

const mdConverter = new showdown.Converter()

function md(s) { return  mdConverter.makeHtml(s)}
</script>

<template>
  <v-container>
    <ContentRenderer :value="data" >
      <h1 v-html= "data[ttitle] ? data[ttitle] : data.title" />
      <div v-html= "md(data.content_nl)" />
    </ContentRenderer>
  </v-container>
</template>
