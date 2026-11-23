import PlaygroundThemeSelect from '../components/PlaygroundThemeSelect.vue'

export default defineNuxtPlugin(() => {
  setAppNavItems([
    {
      label: 'Expanded Theme',
      to: '/expanded-theme',
      icon: 'lucide:info',
      id: 'expanded-theme',
    },
  ])

  setShellHeaderActions(PlaygroundThemeSelect)
})
