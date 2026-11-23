import type { VueWrapper } from '@vue/test-utils'
import type { HandlerRegistry, RecipeRepository, WorkflowConfig, WorkflowContext } from '#orchestrator'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  toValue,
  watch,
} from 'vue'
import WorkflowSlideAlert from '../components/WorkflowSlideAlert.vue'
import WorkflowWizardActions from '../components/WorkflowWizardActions.vue'
import WorkflowWizardDrawer from '../components/WorkflowWizardDrawer.vue'
import WorkflowWizardField from '../components/WorkflowWizardField.vue'
import WorkflowWizardFieldList from '../components/WorkflowWizardFieldList.vue'
import WorkflowWizardFields from '../components/WorkflowWizardFields.vue'
import WorkflowWizardKeyValueField from '../components/WorkflowWizardKeyValueField.vue'
import WorkflowWizardShell from '../components/WorkflowWizardShell.vue'
import WorkflowWizardStepContent from '../components/WorkflowWizardStepContent.vue'
import WorkflowWizardStepper from '../components/WorkflowWizardStepper.vue'
import { useWizardDrawerSide } from '../composables/useWizardDrawerSide'

export interface MountShellOptions {
  config: WorkflowConfig
  registry: HandlerRegistry
  routePath?: string
  globals?: Record<string, unknown>
  recipeRepository?: RecipeRepository
  initialRecipeId?: string
  initialSnapshot?: WorkflowContext
  snapshotHydrateErrorTitle?: string
  landOn?: string
}

export interface ShellHarness {
  wrapper: VueWrapper
  route: { path: string }
  navigateTo: ReturnType<typeof vi.fn<(path: string) => Promise<void>>>
  toastAdd: ReturnType<typeof vi.fn>
}

async function waitForSelect(wrapper: VueWrapper, timeoutMs = 3000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (wrapper.find('select.u-select-stub').exists())
      return
    await flushShell()
    await new Promise(resolve => setTimeout(resolve, 15))
  }
  throw new Error('Select field did not become ready')
}

const TileSelectorStub = defineComponent({
  name: 'TileSelector',
  props: {
    modelValue: { type: String, default: undefined },
    items: {
      type: Array,
      default: () => [],
    },
    disabled: { type: Boolean, default: false },
    name: { type: String, default: 'tiles' },
  },
  emits: ['update:modelValue'],
  template: `
    <div class="tile-selector-stub" :data-name="name">
      <label v-for="item in items" :key="item.id" class="tile-option">
        <input
          type="radio"
          :name="name"
          :value="item.id"
          :checked="modelValue === item.id"
          :disabled="disabled"
          @change="$emit('update:modelValue', item.id)"
        />
        <span>{{ item.label }}</span>
      </label>
    </div>
  `,
})

const UDrawerStub = defineComponent({
  name: 'UDrawer',
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
  },
  emits: ['update:open'],
  template: `
    <div v-if="open" data-testid="workflow-drawer">
      <div data-testid="drawer-title">{{ title }}</div>
      <slot name="body" />
      <slot />
    </div>
  `,
})

const UButtonStub = defineComponent({
  name: 'UButton',
  props: {
    label: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  emits: ['click'],
  template: `
    <button
      type="button"
      :disabled="disabled || loading"
      @click="$emit('click')"
    >{{ label }}<slot /></button>
  `,
})

const UInputStub = defineComponent({
  name: 'UInput',
  props: {
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  template: `
    <input
      class="u-input-stub"
      :value="modelValue"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  `,
})

const USelectStub = defineComponent({
  name: 'USelect',
  props: {
    modelValue: { type: String, default: undefined },
    items: {
      type: Array,
      default: () => [],
    },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  template: `
    <select
      class="u-select-stub"
      :value="modelValue ?? ''"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="" disabled>Select…</option>
      <option v-for="item in items" :key="item.value" :value="item.value">{{ item.label }}</option>
    </select>
  `,
})

const USwitchStub = defineComponent({
  name: 'USwitch',
  props: {
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  template: `
    <input
      type="checkbox"
      class="u-switch-stub"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
  `,
})

const USelectMenuStub = defineComponent({
  name: 'USelectMenu',
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    items: {
      type: Array,
      default: () => [],
    },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  template: `
    <select
      class="u-select-menu-stub"
      multiple
      :disabled="disabled"
      @change="onChange"
    >
      <option
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :selected="(modelValue as string[]).includes(item.value)"
      >{{ item.label }}</option>
    </select>
  `,
  methods: {
    onChange(event: Event) {
      const select = event.target as HTMLSelectElement
      const values = Array.from(select.selectedOptions).map(option => option.value)
      this.$emit('update:modelValue', values)
    },
  },
})

const shellStubs = {
  UPageHeader: { template: '<div><slot /><slot name="links" /></div>' },
  UCard: { template: '<div data-testid="step-card"><slot /></div>' },
  UAlert: {
    props: ['title', 'description'],
    template: '<div class="u-alert-stub">{{ title }} {{ description }}</div>',
  },
  UModal: true,
  UStepper: { template: '<div data-testid="stepper" />' },
  UFormField: { template: '<div class="u-form-field"><slot /></div>' },
  UIcon: true,
  USkeleton: true,
  URadioGroup: true,
  WorkflowRecipesDialog: true,
  WorkflowSaveRecipeDialog: true,
  WorkflowWizardRelocate: true,
}

let activeHarness: ShellHarness | undefined

export function getActiveShellHarness(): ShellHarness | undefined {
  return activeHarness
}

export function mountWorkflowWizardShell(options: MountShellOptions): ShellHarness {
  const route = reactive({ path: options.routePath ?? options.config.basePath })
  const navigateTo = vi.fn(async (path: string) => {
    route.path = path
  })
  const toastAdd = vi.fn()

  vi.stubGlobal('ref', ref)
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('watch', watch)
  vi.stubGlobal('onMounted', onMounted)
  vi.stubGlobal('defineComponent', defineComponent)
  vi.stubGlobal('resolveComponent', (name: string) =>
    defineComponent({ name, template: '<div><slot /><slot name="header" /></div>' }))
  vi.stubGlobal('onBeforeRouteLeave', vi.fn())
  vi.stubGlobal('useRoute', () => route)
  vi.stubGlobal('useRouter', () => ({
    back: vi.fn(),
  }))
  vi.stubGlobal('navigateTo', navigateTo)
  vi.stubGlobal('useToast', () => ({ add: toastAdd }))
  vi.stubGlobal('useSeoMeta', vi.fn())
  vi.stubGlobal('useWizardDrawerSide', useWizardDrawerSide)
  vi.stubGlobal('toValue', toValue)

  const wrapper = mount(WorkflowWizardShell, {
    attachTo: document.body,
    props: {
      config: options.config,
      registry: options.registry,
      globals: options.globals ?? {},
      productLabel: 'Onboarding',
      recipeRepository: options.recipeRepository,
      initialRecipeId: options.initialRecipeId,
      initialSnapshot: options.initialSnapshot,
      snapshotHydrateErrorTitle: options.snapshotHydrateErrorTitle,
      landOn: options.landOn,
    },
    global: {
      stubs: shellStubs,
      components: {
        WorkflowWizardStepper,
        WorkflowWizardStepContent,
        WorkflowWizardFields,
        WorkflowWizardFieldList,
        WorkflowWizardField,
        WorkflowWizardKeyValueField,
        WorkflowWizardActions,
        WorkflowWizardDrawer,
        WorkflowSlideAlert,
        TileSelector: TileSelectorStub,
        TileGroupSection: { template: '<div><slot /></div>' },
        UDrawer: UDrawerStub,
        UButton: UButtonStub,
        UInput: UInputStub,
        USelect: USelectStub,
        USelectMenu: USelectMenuStub,
        USwitch: USwitchStub,
      },
    },
  })

  const harness: ShellHarness = { wrapper, route, navigateTo, toastAdd }
  activeHarness = harness
  return harness
}

export async function flushShell(): Promise<void> {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

export async function clickButtonByLabel(
  wrapper: VueWrapper,
  label: string,
): Promise<void> {
  const buttons = wrapper.findAll('button')
  const match = buttons.find(btn => btn.text().includes(label))
  if (!match)
    throw new Error(`Button not found: ${label}`)
  await match.trigger('click')
  await flushShell()
}

export async function selectTile(wrapper: VueWrapper, label: string): Promise<void> {
  const option = wrapper.findAll('.tile-option').find(el => el.text().includes(label))
  if (!option)
    throw new Error(`Tile not found: ${label}`)
  const input = option.find('input[type="radio"]')
  await input.setValue(true)
  await flushShell()
}

export async function selectOption(wrapper: VueWrapper, value: string): Promise<void> {
  await waitForSelect(wrapper)
  const select = wrapper.find('select.u-select-stub')
  await select.setValue(value)
  await flushShell()
}

export function teardownShellHarness(): void {
  activeHarness?.wrapper.unmount()
  activeHarness = undefined
  vi.unstubAllGlobals()
}
