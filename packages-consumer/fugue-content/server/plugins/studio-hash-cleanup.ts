const CLEANUP_SCRIPT = '<script>if(location.hash===\'#_studio_scan\')history.replaceState(history.state,\'\',location.pathname+location.search)</script>'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    // bodyPrepend runs before #__nuxt — must execute before Vue hydrates.
    html.bodyPrepend.unshift(CLEANUP_SCRIPT)
  })
})
