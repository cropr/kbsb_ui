<template>
    <main>
      <ContentRenderer :value="data" />
      <ContentRenderer :value="data" >
        <div v-html= "md(data.content_nl)" />
      </ContentRenderer>

    </main>
</template>

<script setup>
import showdown from 'showdown'

const {data}  = await useAsyncData('index', () => queryContent('/').findOne())
console.log("data", data, data._rawValue.content_nl)

const mdConverter = new showdown.Converter()

function md(s) { return  mdConverter.makeHtml(s)}
</script>