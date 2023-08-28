<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useIdtokenStore}  from '@/store/idtoken'
import showdown from 'showdown'

const { locale } = useI18n()
const localePath = useLocalePath()
const { $backend } = useNuxtApp()
const router = useRouter() 
const route = useRoute()
const idstore = useIdtokenStore()

// help dialog 
const ttitle = `title_${locale.value}`
const tcontent = `content_${locale.value}`
const { data: help }  = await useAsyncData('help-login', () => queryContent('/pages/help-login').findOne())
const helpdialog = ref(false)
const login = ref({})
const url =  route.query.url
const mdConverter = new showdown.Converter()
function md(s) { return  mdConverter.makeHtml(s)}

async function dologin() {
  const returnUrl = this.url ? this.url.replaceAll("__", "/") : '/'
  try {
    const reply = await $backend("old", "login", {
      idnumber: this.login.idnumber,
      password: this.login.password
    })
    console.log('reply', reply)
    idstore.updateToken(reply.data)
  } 
  catch(error) {
    const reply = error.response
    console.error('Login failed', reply)
    // TODO snackbar
    return
  }
  console.log('goint to ', returnUrl)
  navigateTo(localePath(returnUrl))
}

</script>
<template>
  <v-container>
    <v-row align="start">
      <v-col cols="12" md="6" offset-md="3" lg="6" offset-lg="3">
        <v-card>
          <v-card-title>
            <v-icon large>
              mdi-account
            </v-icon>
            <label class="headline ml-3">{{ $t('Sign in') }}</label>
            <v-btn icon="" color="green" class="float-right"><b>?</b>
              <v-dialog v-model="helpdialog" width="20em"  activator="parent">
                <ContentRenderer :value="help">
                  <v-card>
                    <v-card-title v-html="help[ttitle] ? help[ttitle] : help.title" />
                    <v-divider></v-divider>
                    <v-card-text class="pt-3 markdowncontent" v-html="md(help[tcontent])"> 
                    </v-card-text>
                  </v-card>
                </ContentRenderer>
              </v-dialog>            
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-text-field v-model="login.idnumber" :label="$t('ID number')" />
            <v-text-field v-model="login.password" xs="12" lg="6" :label="$t('Password')" type="password" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="dologin()">
              {{ $t('Submit') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


