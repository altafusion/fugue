import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineNuxtModule, logger } from '@nuxt/kit'

const log = logger.withTag('fugue-content-site')

/** Names referenced by landing.sections[].component in each locale settings/site.yml. */
function collectLandingComponentNames(rootDir: string): Set<string> {
  const names = new Set<string>()
  const contentDir = join(rootDir, 'content')

  if (!existsSync(contentDir))
    return names

  for (const entry of readdirSync(contentDir, { withFileTypes: true })) {
    if (!entry.isDirectory())
      continue

    const siteYml = join(contentDir, entry.name, 'settings', 'site.yml')
    if (!existsSync(siteYml))
      continue

    const text = readFileSync(siteYml, 'utf8')
    let inLanding = false
    let inComponentObject = false

    for (const line of text.split('\n')) {
      if (/^landing:\s*$/.test(line)) {
        inLanding = true
        inComponentObject = false
        continue
      }
      if (inLanding && /^[^\s#]/.test(line)) {
        inLanding = false
        inComponentObject = false
      }

      if (!inLanding)
        continue

      const shorthand = line.match(/^\s+component:\s+(\w+)\s*(?:#.*)?$/)
      if (shorthand?.[1] && shorthand[1] !== 'FugueContentFragment') {
        names.add(shorthand[1])
        inComponentObject = false
        continue
      }

      if (/^\s+component:\s*$/.test(line)) {
        inComponentObject = true
        continue
      }

      if (inComponentObject) {
        const nameMatch = line.match(/^\s+name:\s+(\w+)\s*(?:#.*)?$/)
        if (nameMatch?.[1])
          names.add(nameMatch[1])

        const contentComponentMatch = line.match(/^\s+contentComponent:\s+(\w+)\s*(?:#.*)?$/)
        if (contentComponentMatch?.[1])
          names.add(contentComponentMatch[1])
      }

      if (/^ {6}\S/.test(line) && !/^ {6}component:/.test(line))
        inComponentObject = false
    }
  }

  return names
}

/**
 * Mark app landing section components as global so SSR includes them for
 * FugueContentLandingPage dynamic component resolution (manifest-only refs are tree-shaken otherwise).
 */
export default defineNuxtModule({
  meta: {
    name: 'fugue-content-landing-components'
  },
  setup(_options, nuxt) {
    const landingComponentNames = collectLandingComponentNames(nuxt.options.rootDir)

    if (!landingComponentNames.size)
      return

    log.info(`Landing components: ${[...landingComponentNames].join(', ')}`)

    nuxt.hook('components:extend', (components) => {
      for (const component of components) {
        const name = component.pascalName
        if (name && landingComponentNames.has(name))
          component.global = true
      }
    })
  }
})
