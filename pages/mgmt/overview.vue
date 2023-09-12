<script set>
import { ref, computed, onMounted } from 'vue'
import { useMgmtTokenStore } from "@/store/mgmttoken";
import { usePersonStore } from "@/store/person";
import { storeToRefs } from "pinia";

const config = useRuntimeConfig()
const mgmtstore = useMgmtTokenStore()
const personstore = usePersonStore()
const { person } = storeToRefs(personstore)

let checkinlaunched = false
let checkinsuccess = false

definePageMeta({
  layout: "mgmt",
})

useHead({
  title: 'Management Overview',
  // we need google script to load because we might redirect internally
  // to index in case we fail the authentication
  script: [
    { src: 'https://accounts.google.com/gsi/client', async: true, defer: true }
  ]
})

function checkAuth () {
  if (person.value.credential.length === 0) {
    navigateTo('/mgmt')
  }
  if (!person.value.email.endsWith('@frbe-kbsb-ksb.be')) {
    navigateTo('/mgmt')
  }
}

async function checkin () {
  checkinlaunched = true
  const data = {
    user: person.value.user,
    email: person.value.email,
    branch: config.public.repo_branch,
  }
  let reply = await fetch(config.oublic.statamic_url + '/python/checkin', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  console.log('reply', reply)
  checkinlaunched = false
  checkinsuccess = true
}

async function checkout () {
  checkoutlaunched = true
  const data = {
    user: person.value.user,
    email: person.value.email,
    branch: config.public.repo_branch,
  }
  const reply = await fetch(config.public.statamic_url + '/python/checkout', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  console.log('reply', reply)
  checkoutlaunched = false
  checkoutsuccess = true
}

function openCollections () {
  const stUrl = config.public.statamic_url
  window.open(`${stUrl}/cp/collections`, '_statamic')
}

onMounted(()=> {
  checkAuth()
})
</script>


<template>
  <v-container>
    <h1>Overview Management FRBE KBSB KSB</h1>
    <p>Here you can add, modify or delete the content of pages and news articles</p>
    <p>
      For the upload of reports of meetings and other files, we still use the old
      interface at
      <a href="/mgmt/filelist">Files (Reports)</a>
    </p>
    <p>
      Documentation about this website can be found at 
      <a href="https://sites.google.com/frbe-kbsb-ksb.be/internal/home">Internal site</a>
    </p>
    <P>Modifying the website is done in 3 steps:</P>
    <ul>
      <li>Managing of the <NuxtLink to="/mgmt/content">Content</NuxtLink> (news articles and pages)</li>
      <li>Admin part of <NuxtLink to="/mgmt/clubs">Clubs Manager</NuxtLink></li>
      <li>Admin part of <NuxtLink to="/mgmt/interclubs">Interclubs Manager</NuxtLink></li>
      <li>Managing of <NuxtLink to="/mgmt/filelist">Files</NuxtLink> (reports and other assets)</li>
    </ul>
    <p>
      Documentaion about the management of the website can be found at 
      <a href="https://sites.google.com/frbe-kbsb-ksb.be/internal/home">Internal site</a>
    </p>
  </v-container>
</template>

