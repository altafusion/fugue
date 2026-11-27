import PlaygroundSecret from '../components/PlaygroundSecret.vue'

/** How a layer or site adds sections: through `$fugueDevtools`, no import of the devtools package. */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', () => {
    nuxtApp.$fugueDevtools?.registerSection({
      id: 'secret',
      label: 'Privileged',
      component: PlaygroundSecret,
      access: 'privileged',
      order: 2,
    })
  })
})
