import { describe, expect, it } from 'vitest'
import { loadWorkflow, safeLoadWorkflow } from './loadWorkflow'

const minimalRegistry = {
  loaders: {
    loadItems: async () => [],
  },
  validators: {
    isValid: () => null,
  },
  actions: {
    save: async () => ({ saved: true }),
  },
  guards: {
    allowNext: () => true,
  },
  transitions: {
    nextRoute: () => '/done',
  },
}

describe('safeLoadWorkflow', () => {
  const validYaml = `
workflow: ok
version: 1
entry: only
basePath: /ok
steps:
  - id: only
    title: Only
    interactions:
      transitions: [{ target: /done }]
`

  it('returns ok for valid yaml', () => {
    const result = safeLoadWorkflow(validYaml)
    expect(result.ok).toBe(true)
    if (result.ok)
      expect(result.config.workflow).toBe('ok')
  })

  it('returns !ok with recovered basePath for unknown input type', () => {
    const yamlText = `
workflow: bad-type
version: 1
entry: only
basePath: /bad-type
steps:
  - id: only
    title: Only
    interactions:
      inputs:
        - field: name
          type: unknown
      transitions: [{ target: /done }]
`
    const result = safeLoadWorkflow(yamlText)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.basePath).toBe('/bad-type')
      expect(result.error).toMatch(/invalid workflow shape/)
    }
  })

  it('returns !ok for extra unknown step keys (strict schema)', () => {
    const yamlText = `
workflow: strict
version: 1
entry: only
basePath: /strict
steps:
  - id: only
    title: Only
    bogus: true
    interactions:
      transitions: [{ target: /done }]
`
    const result = safeLoadWorkflow(yamlText)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.basePath).toBe('/strict')
      expect(result.error).toMatch(/invalid workflow shape/)
    }
  })

  it('returns !ok when a referenced handler is missing from the registry', () => {
    const yamlText = `
workflow: bad-loader
version: 1
entry: only
basePath: /bad-loader
steps:
  - id: only
    title: Only
    interactions:
      inputs:
        - field: item
          type: select
          source: { effect: fetch, handler: missingLoader }
      transitions: [{ target: /done }]
`
    const result = safeLoadWorkflow(yamlText, minimalRegistry)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.basePath).toBe('/bad-loader')
      expect(result.error).toMatch(/missing loader handler "missingLoader"/)
    }
  })
})

describe('loadWorkflow', () => {
  it('requires options for tiles inputs', () => {
    const yamlText = `
workflow: tiles
version: 1
entry: only
basePath: /tiles
steps:
  - id: only
    title: Pick One
    interactions:
      inputs:
        - field: source
          type: tiles
          required: true
      transitions:
        - target: /done
`
    expect(() => loadWorkflow(yamlText)).toThrow(/tiles inputs require options/)
  })

  it('accepts default on tiles and choice inputs', () => {
    const yamlText = `
workflow: defaults
version: 1
entry: only
basePath: /defaults
steps:
  - id: only
    title: Pick One
    interactions:
      inputs:
        - field: source
          type: tiles
          default: github
          options:
            - { id: github, label: GitHub }
            - { id: local, label: Local }
        - field: mode
          type: choice
          default: new
          choices: [new, existing]
      transitions:
        - target: /done
`
    const loaded = loadWorkflow(yamlText)
    expect(loaded.steps[0]?.interactions.inputs?.[0]?.default).toBe('github')
    expect(loaded.steps[0]?.interactions.inputs?.[1]?.default).toBe('new')
  })

  it('accepts multiselect and keyValue input types', () => {
    const yamlText = `
workflow: new-field-types
version: 1
entry: only
basePath: /new-field-types
steps:
  - id: only
    title: Configure
    interactions:
      inputs:
        - field: allowedAdGroupIds
          type: multiselect
          choices: [grp-1, grp-2]
        - field: additionalRequestHeaders
          type: keyValue
      transitions:
        - target: /done
`
    const loaded = loadWorkflow(yamlText)
    const inputs = loaded.steps[0]?.interactions.inputs ?? []
    expect(inputs[0]?.type).toBe('multiselect')
    expect(inputs[0]?.choices).toEqual(['grp-1', 'grp-2'])
    expect(inputs[1]?.type).toBe('keyValue')
  })

  it('requires choices or source on multiselect inputs', () => {
    const yamlText = `
workflow: bad-multiselect
version: 1
entry: only
basePath: /bad-multiselect
steps:
  - id: only
    title: Configure
    interactions:
      inputs:
        - field: allowedAdGroupIds
          type: multiselect
      transitions:
        - target: /done
`
    expect(() => loadWorkflow(yamlText)).toThrow(/multiselect inputs require either choices or source/)
  })

  describe('composite inputs', () => {
    const compositeYaml = (input: string) => `
workflow: composite
version: 1
entry: only
basePath: /composite
steps:
  - id: only
    title: Upload Details
    interactions:
      inputs:
${input}
      transitions:
        - target: /done
`

    const registryWithComponent = {
      components: {
        sourceArchiveUpload: { name: 'SourceArchiveUpload' },
      },
    }

    it('loads a composite whose component is registered, passing config through untouched', () => {
      const yamlText = compositeYaml(`        - field: sourceArchive
          type: composite
          component: sourceArchiveUpload
          required: true
          config:
            accept: ['.zip', '.tar.gz']
            maxSizeFrom: ui.upload.maxFileSizeBytes`)

      const input = loadWorkflow(yamlText, registryWithComponent).steps[0]?.interactions.inputs?.[0]
      expect(input?.component).toBe('sourceArchiveUpload')
      expect(input?.config).toEqual({
        accept: ['.zip', '.tar.gz'],
        maxSizeFrom: 'ui.upload.maxFileSizeBytes',
      })
    })

    it('requires a component', () => {
      const yamlText = compositeYaml(`        - field: sourceArchive
          type: composite
          required: true`)

      expect(() => loadWorkflow(yamlText, registryWithComponent))
        .toThrow(/composite inputs require a component/)
    })

    it('fails at parse when the component is not registered', () => {
      const yamlText = compositeYaml(`        - field: sourceArchive
          type: composite
          component: notRegistered`)

      expect(() => loadWorkflow(yamlText, registryWithComponent))
        .toThrow(/missing component "notRegistered"/)
    })

    it('rejects component, config and reads on other input types', () => {
      const withComponent = compositeYaml(`        - field: name
          type: text
          component: sourceArchiveUpload`)
      expect(() => loadWorkflow(withComponent, registryWithComponent))
        .toThrow(/component is only supported on composite inputs/)

      const withConfig = compositeYaml(`        - field: name
          type: text
          config:
            accept: ['.zip']`)
      expect(() => loadWorkflow(withConfig, registryWithComponent))
        .toThrow(/config is only supported on composite inputs/)

      const withReads = compositeYaml(`        - field: name
          type: text
          reads:
            workload: workloadType`)
      expect(() => loadWorkflow(withReads, registryWithComponent))
        .toThrow(/reads is only supported on composite inputs/)
    })

    it('rejects default on composite inputs', () => {
      const yamlText = compositeYaml(`        - field: sourceArchive
          type: composite
          component: sourceArchiveUpload
          default: placeholder`)
      expect(() => loadWorkflow(yamlText, registryWithComponent))
        .toThrow(/default is not supported on composite inputs/)
    })

    it('rejects a reads mapping onto a context key nothing produces', () => {
      const yamlText = compositeYaml(`        - field: sourceArchive
          type: composite
          component: sourceArchiveUpload
          reads:
            workload: neverProduced`)

      expect(() => loadWorkflow(yamlText, registryWithComponent))
        .toThrow(/reads\.workload maps to context key "neverProduced" which is not produced upstream/)
    })

    it('accepts a reads mapping onto a declared global', () => {
      const yamlText = `
workflow: composite-reads
version: 1
entry: only
basePath: /composite-reads
context:
  globals: [workloadType]
steps:
  - id: only
    title: Upload Details
    interactions:
      inputs:
        - field: sourceArchive
          type: composite
          component: sourceArchiveUpload
          reads:
            workload: workloadType
      transitions:
        - target: /done
`
      const input = loadWorkflow(yamlText, registryWithComponent).steps[0]?.interactions.inputs?.[0]
      expect(input?.reads).toEqual({ workload: 'workloadType' })
    })
  })

  it('accepts a variant on tiles inputs', () => {
    const yamlText = `
workflow: tiles-variant
version: 1
entry: only
basePath: /tiles-variant
steps:
  - id: only
    title: Pick One
    interactions:
      inputs:
        - field: source
          type: tiles
          required: true
          variant: row
          options:
            - { id: a, label: A }
      transitions:
        - target: /done
`
    const config = loadWorkflow(yamlText)
    expect(config.steps[0]?.interactions.inputs?.[0]?.variant).toBe('row')
  })

  it('rejects a variant on non-tiles inputs', () => {
    const yamlText = `
workflow: bad-variant
version: 1
entry: only
basePath: /bad-variant
steps:
  - id: only
    title: Pick One
    interactions:
      inputs:
        - field: name
          type: text
          variant: row
      transitions:
        - target: /done
`
    expect(() => loadWorkflow(yamlText)).toThrow(/variant is only supported on tiles inputs/)
  })

  it('accepts input note and step footer.note', () => {
    const yamlText = `
workflow: notes
version: 1
entry: only
basePath: /notes
steps:
  - id: only
    title: Only
    interactions:
      inputs:
        - field: extra
          type: text
          note: Optional helper under the label.
      transitions:
        - target: /done
    footer:
      note: Step-level note above the action buttons.
`
    const config = loadWorkflow(yamlText)
    expect(config.steps[0]?.interactions.inputs?.[0]?.note).toBe('Optional helper under the label.')
    expect(config.steps[0]?.footer?.note).toBe('Step-level note above the action buttons.')
  })

  it('accepts an input label override', () => {
    const yamlText = `
workflow: labels
version: 1
entry: only
basePath: /labels
steps:
  - id: only
    title: Only
    interactions:
      inputs:
        - field: authMode
          type: tiles
          label: Auth Mode
          options:
            - id: sso
              label: Single Sign-On
      transitions:
        - target: /done
`
    const config = loadWorkflow(yamlText)
    expect(config.steps[0]?.interactions.inputs?.[0]?.label).toBe('Auth Mode')
  })

  it('rejects unknown keys under step footer (strict schema)', () => {
    const yamlText = `
workflow: strict-footer
version: 1
entry: only
basePath: /strict-footer
steps:
  - id: only
    title: Only
    footer:
      note: ok
      bogus: true
    interactions:
      transitions: [{ target: /done }]
`
    expect(() => loadWorkflow(yamlText)).toThrow(/invalid workflow shape/)
  })

  it('rejects step footer without note', () => {
    const yamlText = `
workflow: empty-footer
version: 1
entry: only
basePath: /empty-footer
steps:
  - id: only
    title: Only
    footer: {}
    interactions:
      transitions: [{ target: /done }]
`
    expect(() => loadWorkflow(yamlText)).toThrow(/invalid workflow shape/)
  })

  it('rejects tile option with both description and string hint', () => {
    const yamlText = `
workflow: bad-option
version: 1
entry: only
basePath: /bad-option
steps:
  - id: only
    title: Only
    interactions:
      inputs:
        - field: pick
          type: tiles
          options:
            - id: a
              label: A
              description: Body copy
              hint: Card helper
      transitions:
        - target: /done
`
    expect(() => loadWorkflow(yamlText)).toThrow(/invalid workflow shape/)
  })

  it('throws on invalid workflow shape', () => {
    expect(() => loadWorkflow('workflow: broken\nsteps: not-an-array')).toThrow(/invalid workflow shape/)
  })

  it('parses stepper.navigable and order, and rejects unknown stepper keys', () => {
    const base = `
workflow: nav
version: 1
entry: only
basePath: /nav
STEPPER
steps:
  - id: only
    title: Only
    interactions:
      transitions: [{ target: /done }]
`
    expect(loadWorkflow(base.replace('STEPPER', 'stepper:\n  navigable: true')).stepper?.navigable).toBe(true)
    expect(loadWorkflow(base.replace('STEPPER', 'stepper:\n  order: array')).stepper?.order).toBe('array')
    expect(() => loadWorkflow(base.replace('STEPPER', 'stepper:\n  bogus: true'))).toThrow(/invalid workflow shape/)
  })

  it('throws when a referenced loader handler is missing', () => {
    const yamlText = `
workflow: bad-loader
version: 1
entry: only
basePath: /bad-loader
steps:
  - id: only
    title: Only
    interactions:
      inputs:
        - field: item
          type: select
          source: { effect: fetch, handler: missingLoader }
      transitions: [{ target: /done }]
`
    expect(() => loadWorkflow(yamlText, minimalRegistry)).toThrow(/missing loader handler "missingLoader"/)
  })

  it('throws when a transition target is dangling', () => {
    const yamlText = `
workflow: bad-target
version: 1
entry: start
basePath: /bad-target
steps:
  - id: start
    title: Start
    interactions:
      transitions: [{ target: nowhere }]
`
    expect(() => loadWorkflow(yamlText)).toThrow(/target "nowhere"/)
  })

  it('throws when a step requires an unproducible context key', () => {
    const yamlText = `
workflow: bad-requires
version: 1
entry: first
basePath: /bad-requires
steps:
  - id: first
    title: First
    interactions:
      transitions: [{ target: second }]
  - id: second
    title: Second
    requires: [missingKey]
    interactions:
      transitions: [{ target: /done }]
`
    expect(() => loadWorkflow(yamlText)).toThrow(/requires context key "missingKey"/)
  })

  it('throws when entry refers to an unknown step id', () => {
    const yamlText = `
workflow: bad-entry
version: 1
entry: missing
basePath: /bad-entry
steps:
  - id: real
    title: Real
    interactions:
      transitions: [{ target: /done }]
`
    expect(() => loadWorkflow(yamlText)).toThrow(/entry "missing"/)
  })

  it('allows external transition targets', () => {
    const yamlText = `
workflow: external
version: 1
entry: start
basePath: /external
steps:
  - id: start
    title: Start
    interactions:
      transitions: [{ target: /deploy-catalog }]
`
    expect(loadWorkflow(yamlText).entry).toBe('start')
  })

  it('throws when two steps share the same id', () => {
    const yamlText = `
workflow: dup-id
version: 1
entry: a
basePath: /dup-id
steps:
  - id: a
    title: A
    interactions:
      transitions: [{ target: b }]
  - id: a
    slug: second
    title: A Again
    interactions:
      transitions: [{ target: /done }]
`
    expect(() => loadWorkflow(yamlText)).toThrow(/duplicate step id "a"/)
  })

  describe('input groups', () => {
    it('loads a valid config with groups', () => {
      const yamlText = `
workflow: groups
version: 1
entry: only
basePath: /groups
steps:
  - id: only
    title: Configure & Deploy
    groups:
      - id: source
        title: Source Details
        description: Where the archive comes from.
      - id: runtime
        title: Runtime Configuration
        collapsed: true
    interactions:
      inputs:
        - field: name
          type: text
        - field: archive
          type: text
          group: source
        - field: command
          type: text
          group: runtime
      transitions:
        - target: /done
`
      const step = loadWorkflow(yamlText).steps[0]
      expect(step?.groups).toEqual([
        {
          id: 'source',
          title: 'Source Details',
          description: 'Where the archive comes from.',
        },
        {
          id: 'runtime',
          title: 'Runtime Configuration',
          collapsed: true,
        },
      ])
      expect(step?.interactions.inputs?.[1]?.group).toBe('source')
    })

    it('throws when an input references an undeclared group id', () => {
      const yamlText = `
workflow: bad-group-ref
version: 1
entry: only
basePath: /bad-group-ref
steps:
  - id: only
    title: Only
    groups:
      - id: source
        title: Source Details
    interactions:
      inputs:
        - field: archive
          type: text
          group: missing
      transitions:
        - target: /done
`
      expect(() => loadWorkflow(yamlText)).toThrow(/input references unknown group id "missing"/)
    })

    it('throws when an input references a group id without a groups key', () => {
      const yamlText = `
workflow: bad-group-ref-no-groups
version: 1
entry: only
basePath: /bad-group-ref-no-groups
steps:
  - id: only
    title: Only
    interactions:
      inputs:
        - field: archive
          type: text
          group: missing
      transitions:
        - target: /done
`
      expect(() => loadWorkflow(yamlText)).toThrow(/input references unknown group id "missing"/)
    })

    it('throws when duplicate group ids appear within one step', () => {
      const yamlText = `
workflow: dup-group
version: 1
entry: only
basePath: /dup-group
steps:
  - id: only
    title: Only
    groups:
      - id: source
        title: Source Details
      - id: source
        title: Source Again
    interactions:
      transitions:
        - target: /done
`
      expect(() => loadWorkflow(yamlText)).toThrow(/duplicate group id "source"/)
    })

    it('throws when a group title is not title case', () => {
      const yamlText = `
workflow: bad-group-title
version: 1
entry: only
basePath: /bad-group-title
steps:
  - id: only
    title: Only
    groups:
      - id: source
        title: source details
    interactions:
      transitions:
        - target: /done
`
      expect(() => loadWorkflow(yamlText)).toThrow(/group title must use title case/)
    })

    it('loads a valid config with layout columns', () => {
      const yamlText = `
workflow: group-layout
version: 1
entry: only
basePath: /group-layout
steps:
  - id: only
    title: Only
    groups:
      - id: pair
        title: Pair Fields
        layout: columns
    interactions:
      inputs:
        - field: left
          type: text
          group: pair
        - field: right
          type: text
          group: pair
      transitions:
        - target: /done
`
      expect(loadWorkflow(yamlText).steps[0]?.groups?.[0]?.layout).toBe('columns')
    })

    it('throws when a group layout is unknown', () => {
      const yamlText = `
workflow: bad-group-layout
version: 1
entry: only
basePath: /bad-group-layout
steps:
  - id: only
    title: Only
    groups:
      - id: pair
        title: Pair Fields
        layout: row
    interactions:
      transitions:
        - target: /done
`
      expect(() => loadWorkflow(yamlText)).toThrow(/invalid workflow shape/)
    })
  })

  it('throws when an action declares an effect without a handler', () => {
    const yamlText = `
workflow: bad-action
version: 1
entry: only
basePath: /bad-action
steps:
  - id: only
    title: Only
    interactions:
      actions: [{ id: submit, label: Deploy, effect: mutate }]
      transitions: [{ on: submit.success, target: /done }]
`
    expect(() => loadWorkflow(yamlText)).toThrow(/requires a handler/)
  })

  it('throws when a transition specifies neither target nor dynamic', () => {
    const yamlText = `
workflow: bad-transition
version: 1
entry: only
basePath: /bad-transition
steps:
  - id: only
    title: Only
    interactions:
      transitions: [{ on: something }]
`
    expect(() => loadWorkflow(yamlText)).toThrow(/must specify a "target" or a "dynamic"/)
  })

  it('treats bare DSL keyword guards as inline expressions, not handler ids', () => {
    const yamlText = `
workflow: keyword-guard
version: 1
entry: only
basePath: /keyword-guard
steps:
  - id: only
    title: Only
    interactions:
      inputs:
        - field: name
          type: text
          when: 'false'
      transitions: [{ target: /done, when: 'true' }]
`
    // 'false' / 'true' must parse via the DSL, not resolve to a missing guard handler.
    expect(() => loadWorkflow(yamlText, minimalRegistry)).not.toThrow()
  })

  it('throws when a step has duplicate input fields', () => {
    const yamlText = `
workflow: dup-field
version: 1
entry: only
basePath: /dup-field
steps:
  - id: only
    title: Only
    interactions:
      inputs:
        - field: name
          type: text
        - field: name
          type: text
      transitions: [{ target: /done }]
`
    expect(() => loadWorkflow(yamlText)).toThrow(/duplicate input field "name"/)
  })

  it('throws when a step has duplicate action ids', () => {
    const yamlText = `
workflow: dup-action
version: 1
entry: only
basePath: /dup-action
steps:
  - id: only
    title: Only
    interactions:
      actions:
        - { id: go, label: Go }
        - { id: go, label: Go again }
      transitions: [{ target: /done }]
`
    expect(() => loadWorkflow(yamlText)).toThrow(/duplicate action id "go"/)
  })

  it('throws when two steps resolve to the same route', () => {
    const yamlText = `
workflow: dup-route
version: 1
entry: a
basePath: /dup
steps:
  - id: a
    title: A
    interactions:
      transitions: [{ target: b }]
  - id: b
    slug: shared
    title: B
    interactions:
      transitions: [{ target: c }]
  - id: c
    slug: shared
    title: C
    interactions:
      transitions: [{ target: /done }]
`
    expect(() => loadWorkflow(yamlText)).toThrow(/resolve to the same route/)
  })

  describe('transition-mode graph reachability', () => {
    it('accepts a key produced on all paths before a join step', () => {
      const yamlText = `
workflow: join-ok
version: 1
entry: start
basePath: /join-ok
steps:
  - id: start
    title: Start
    interactions:
      transitions:
        - target: left
        - target: right
    output:
      produces: [shared]
  - id: left
    title: Left
    interactions:
      transitions: [{ target: join }]
    output:
      produces: [leftOnly]
  - id: right
    title: Right
    interactions:
      transitions: [{ target: join }]
    output:
      produces: [rightOnly]
  - id: join
    title: Join
    requires: [shared]
    interactions:
      transitions: [{ target: /done }]
`
      expect(loadWorkflow(yamlText).entry).toBe('start')
    })

    it('throws when a key is produced on only one branch but required at the join', () => {
      const yamlText = `
workflow: join-bad
version: 1
entry: start
basePath: /join-bad
steps:
  - id: start
    title: Start
    interactions:
      transitions:
        - target: left
        - target: right
  - id: left
    title: Left
    interactions:
      transitions: [{ target: join }]
    output:
      produces: [branchKey]
  - id: right
    title: Right
    interactions:
      transitions: [{ target: join }]
  - id: join
    title: Join
    requires: [branchKey]
    interactions:
      transitions: [{ target: /done }]
`
      expect(() => loadWorkflow(yamlText)).toThrow(/requires context key "branchKey"/)
    })

    it('accepts a step reachable only via action onError from an otherwise-reachable step', () => {
      const yamlText = `
workflow: error-recover
version: 1
entry: start
basePath: /error-recover
steps:
  - id: start
    title: Start
    interactions:
      actions:
        - { id: go, label: Go, effect: mutate, handler: save, onError: recover }
      transitions: [{ target: /done }]
  - id: recover
    title: Recover
    interactions:
      transitions: [{ target: /done }]
`
      expect(loadWorkflow(yamlText, minimalRegistry).entry).toBe('start')
    })

    it('throws an orphan-step error when nothing transitions into a step', () => {
      const yamlText = `
workflow: unreachable
version: 1
entry: start
basePath: /unreachable
steps:
  - id: start
    title: Start
    interactions:
      transitions: [{ target: /done }]
  - id: orphan
    title: Orphan
    interactions:
      transitions: [{ target: /done }]
`
      // Reordering the array-first case: entry advances straight out, so `orphan`
      // has no incoming transition at all.
      expect(() => loadWorkflow(yamlText)).toThrow(/orphan step "orphan" — no transition targets it/)
    })

    it('throws an island error when a step is reached only via other unreachable steps', () => {
      const yamlText = `
workflow: island
version: 1
entry: start
basePath: /island
steps:
  - id: start
    title: Start
    interactions:
      transitions: [{ target: /done }]
  - id: loop-a
    title: Loop A
    interactions:
      transitions: [{ target: loop-b }]
  - id: loop-b
    title: Loop B
    interactions:
      transitions: [{ target: loop-a }]
`
      // loop-a and loop-b form an unreachable cycle: each IS targeted (by the
      // other) so neither is a bare orphan, but the whole island is cut off from
      // entry. The first one reached in array order is reported.
      expect(() => loadWorkflow(yamlText)).toThrow(/step "loop-a" is unreachable from entry "start" — it is only targeted by other unreachable steps/)
    })

    it('does not flag an orphan when the array is out of order but transitions connect every step', () => {
      // Physically out-of-order array, but the transition graph reaches all steps
      // from entry — transition mode should derive the order and load cleanly.
      const yamlText = `
workflow: reordered
version: 1
entry: first
basePath: /reordered
steps:
  - id: third
    title: Third
    interactions:
      transitions: [{ target: /done }]
  - id: first
    title: First
    interactions:
      transitions: [{ target: second }]
  - id: second
    title: Second
    interactions:
      transitions: [{ target: third }]
`
      const loaded = loadWorkflow(yamlText)
      expect(loaded.entry).toBe('first')
    })
  })

  describe('array-mode availability', () => {
    it('keeps the linear forward-pass when stepper.order is array', () => {
      const yamlText = `
workflow: array-mode
version: 1
entry: first
basePath: /array-mode
stepper:
  order: array
steps:
  - id: first
    title: First
    interactions:
      transitions: [{ target: second }]
    output:
      produces: [firstKey]
  - id: second
    title: Second
    requires: [firstKey]
    interactions:
      transitions: [{ target: third }]
  - id: third
    title: Third
    requires: [missingKey]
    interactions:
      transitions: [{ target: /done }]
`
      expect(() => loadWorkflow(yamlText)).toThrow(/requires context key "missingKey"/)
    })

    it('allows array-order availability even when transition graph would reject', () => {
      const yamlText = `
workflow: array-escape
version: 1
entry: start
basePath: /array-escape
stepper:
  order: array
steps:
  - id: start
    title: Start
    interactions:
      transitions:
        - target: left
        - target: right
  - id: left
    title: Left
    interactions:
      transitions: [{ target: join }]
    output:
      produces: [branchKey]
  - id: right
    title: Right
    interactions:
      transitions: [{ target: join }]
  - id: join
    title: Join
    requires: [branchKey]
    interactions:
      transitions: [{ target: /done }]
`
      expect(loadWorkflow(yamlText).entry).toBe('start')
    })
  })

  it('accepts recipes.snapshotExcludeKeys in workflow yaml', () => {
    const yamlText = `
workflow: snapshot-recipes
version: 1
entry: only
basePath: /snapshot
recipes:
  excludeKeys: [appId]
  snapshotExcludeKeys: [user]
steps:
  - id: only
    title: Only
    interactions:
      transitions: [{ target: /done }]
`
    const config = loadWorkflow(yamlText)
    expect(config.recipes?.excludeKeys).toEqual(['appId'])
    expect(config.recipes?.snapshotExcludeKeys).toEqual(['user'])
  })
})
