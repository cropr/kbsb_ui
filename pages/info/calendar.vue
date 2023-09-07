<script setup>
import { ref, computed } from 'vue'
import { VContainer } from 'vuetify/lib/components/index.mjs';
const { locale, setLocale } = useI18n()
const localePath = useLocalePath()

const calitems = ref([])
const { data: caldata } = await useAsyncData('goal',
  () => queryContent('/calender').find())

function compareDates(a, b) {
  return a.date - b.date
}

const future_ci = computed(() => {
  const yesterday = new Date() - 86400000
  return calitems.value.filter(ci => ci.date > yesterday)
})

function calenderItem(c) {
  const output = []
  output.push(c.date.toLocaleDateString(this.$i18n.locale, { dateStyle: 'medium' }) + ':')
  output.push(c.title)
  if (c.round) {
    output.push(this.$t('Round'))
    output.push(c.round)
  }
  if (c.status === 'postponed') {
    output.push(this.$t('postponed'))
  }
  return output.join(' ')
}

function calenderText(c) {
  return ''
}

function parseCalendarItems(listci) {
  listci.forEach((ci) => {
    if (ci.multiple) {
      this.parseCalendarItems(ci.multiple)
      return
    }
    // console.log('ci', ci.title)
    if (ci.date) {
      const item = { ...ci, date: new Date(ci.date) }
      this.calitems.push(item)
      return
    }
    if (ci.rounds) {
      Object.entries(ci.rounds).forEach(([rnr, date]) => {
        const { rounds, ...item } = { ...ci, date: new Date(date), round: rnr }
        this.calitems.push(item)
      })
    }
  })
}

</script>

<template>
  <VContainer>
    <h1>{{ $t('Calendar') }}</h1>
    <ul>
      <li v-for="c, ix in future_ci" :key="ix" class="calenderitem">
        {{ calenderItem(c) }}
        <div v-if="!!c.text">
          {{ calendarText(c) }}
        </div>
        <div v-if="!!c.link">
          URL: <a :href="c.link">{{ c.link }}</a>
        </div>
      </li>
    </ul>
  </VContainer>
</template>

<style scoped>
.disabled {
  color: #bbb
}

.postponed {
  color: #bbb
}

.calenderitem {
  margin: 8px 0;
}
</style>
