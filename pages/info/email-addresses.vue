<template>
  <v-container>
    <ContentRenderer :value="data" >
      <!-- <h1>{{ data.title }}</h1> -->
      <div v-html= "md(data.content_nl)" />
    </ContentRenderer>
  </v-container>
</template>

<script setup>

import showdown from 'showdown'

const {data}  = await useAsyncData('emailaddresses', 
  () => queryContent('/').findOne())

const mdConverter = new showdown.Converter()
function md(s) { return  mdConverter.makeHtml(s)}

  // head: {
  //   title: 'Email',
  //   link: [
  //     {
  //       rel: 'stylesheet',
  //       href:
  //         'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900'
  //     },
  //     {
  //       rel: 'stylesheet',
  //       href: 'https://fonts.googleapis.com/css?family=Material+Icons'
  //     },
  //     {
  //       rel: 'stylesheet',
  //       href:
  //         'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css'
  //     },
  //     { rel: 'favicon', href: 'favicon.ico' }
  //   ],
  //   meta: [
  //     { charset: 'utf-8' },
  //     { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  //     { hid: 'home', name: 'description', content: 'Meta description' }
  //   ],
  //   script: [
  //     {
  //       src: 'https://apis.google.com/js/platform.js',
  //       async: true,
  //       defer: true
  //     }
  //   ]
  // },

</script>
