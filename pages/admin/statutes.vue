<script setup>
import showdown from 'showdown'
import { ref } from 'vue'

const { locale } = useI18n()
console.log('locale', locale)
const ttitle = `title_${locale.value}`
console.log('ttitle', ttitle)
const { data }  = await useAsyncData('index', () => queryContent('/pages/statutes').findOne())
const tab = ref(null)
const mdConverter = new showdown.Converter()
function md(s) { return  mdConverter.makeHtml(s)}
</script>

<template>
  <v-container>
    <ContentRenderer :value="data">
      <h1 v-html="data[ttitle] ? data[ttitle] : data.title" />
      <v-container class="mt-1 elevation-2">
        <v-tabs v-model="tab" light slider-color="deep-purple">
          <v-tab class="mx-2"> NL </v-tab>
          <v-tab class="mx-2"> FR </v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item>
            <div class="mt-2 markdowncontent" v-html="md(data.content_nl)" />
          </v-window-item>
          <v-window-item>
            <div class="mt-2 markdowncontent" v-html="md(data.content_fr)" />
          </v-window-item>
        </v-window>
      </v-container>
    </ContentRenderer>
  </v-container>
</template>

<style>

.markdowncontent ul, .markdowncontent ol { 
    display: block;
    list-style: disc outside none;
    margin: 1em 0;
    padding: 0 0 0 40px;
}
.markdowncontent ol { 
    list-style-type: decimal;
}

.markdowncontent li {
    display: list-item;
}

.markdowncontent ul ul, .markdowncontent ol ul {
    list-style-type: circle;
    margin-left: 15px; 
}
.markdowncontent ol ol, .markdowncontent ul ol { 
    list-style-type: lower-latin;
    margin-left: 15px; 
}
</style>
