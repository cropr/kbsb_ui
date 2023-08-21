<template>
  <NuxtLayout>
    <v-container>
      <ContentRenderer :value="data" >
        <h1 v-html= "data.title_nl" />
        <div v-html= "md(data.content_nl)" />
      </ContentRenderer>
    </v-container>
  </NuxtLayout>
</template>

<script setup>
import showdown from 'showdown'

const {data}  = await useAsyncData('index', () => queryContent('/es').findOne())

const mdConverter = new showdown.Converter()

function md(s) { return  mdConverter.makeHtml(s)}
</script>