<script setup lang="ts">
const sections = [
  { id: 'typography', label: 'Typography' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'badges', label: 'Badges' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'cards', label: 'Cards' },
  { id: 'tables', label: 'Tables' },
  { id: 'forms', label: 'Forms' },
  { id: 'navs', label: 'Navs' },
  { id: 'breadcrumb', label: 'Breadcrumb' },
  { id: 'accordion', label: 'Accordion' },
  { id: 'progress', label: 'Progress' },
  { id: 'pagination', label: 'Pagination' },
  { id: 'dropdown', label: 'Dropdown' },
] as const

const activeId = ref<string>(sections[0].id)
let observer: IntersectionObserver | undefined

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const hit = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
    const id = hit?.target.id
    if (id)
      activeId.value = id
  }, {
    rootMargin: '-15% 0px -70% 0px',
    threshold: [0, 0.25, 1],
  })

  for (const section of sections) {
    const el = document.getElementById(section.id)
    if (el)
      observer.observe(el)
  }
})

onUnmounted(() => observer?.disconnect())

const buttonColors = [
  'primary',
  'neutral',
  'success',
  'info',
  'warning',
  'error',
] as const
const buttonVariants = [
  'solid',
  'outline',
  'soft',
  'subtle',
  'ghost',
  'link',
] as const

function colorLabel(color: typeof buttonColors[number]) {
  return color.charAt(0).toUpperCase() + color.slice(1)
}

const people = [
  {
    id: 1,
    first: 'Mark',
    last: 'Otto',
    handle: '@mdo',
  },
  {
    id: 2,
    first: 'Jacob',
    last: 'Thornton',
    handle: '@fat',
  },
  {
    id: 3,
    first: 'John',
    last: 'Doe',
    handle: '@social',
  },
]
const columns = [
  { accessorKey: 'id', header: '#' },
  { accessorKey: 'first', header: 'First' },
  { accessorKey: 'last', header: 'Last' },
  { accessorKey: 'handle', header: 'Handle' },
]

const name = ref('')
const email = ref('')
const role = ref('Editor')
const agree = ref(false)
const updates = ref(true)
const choice = ref('one')
const page = ref(1)

const roles = [
  { label: 'Editor', value: 'Editor' },
  { label: 'Admin', value: 'Admin' },
  { label: 'Viewer', value: 'Viewer' },
]
const radioItems = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
]
const tabs = [
  { label: 'Home', content: 'Placeholder content for the Home tab.' },
  { label: 'Profile', content: 'Placeholder content for the Profile tab.' },
  { label: 'Contact', content: 'Placeholder content for the Contact tab.' },
]
const crumbs = [
  { label: 'Home', to: '/' },
  { label: 'Expanded Theme', to: '/expanded-theme' },
  { label: 'Current' },
]
const accordion = [
  { label: 'Accordion Item 1', content: 'The first panel. Open it to see body text on an elevated surface.' },
  { label: 'Accordion Item 2', content: 'The second panel. Spacing and borders should follow the theme.' },
  { label: 'Accordion Item 3', content: 'The third panel. This one starts closed.' },
]
const menuItems = [
  { label: 'Edit' },
  { label: 'Duplicate' },
  { label: 'Delete' },
]

useSeoMeta({ title: 'Expanded Theme' })
</script>

<template>
  <div class="mx-auto flex max-w-6xl gap-10 px-4 py-8 lg:px-6">
    <div class="flex min-w-0 flex-1 flex-col gap-12">
      <header>
        <h1 class="text-3xl font-semibold text-highlighted">
          Expanded Theme
        </h1>
        <p class="mt-3 text-lg text-muted">
          Every common control on one page, in the same spirit as the Bootstrap cheatsheet.
        </p>
        <UButton
          to="/"
          label="Theme Playground"
          variant="link"
          class="mt-2"
        />
      </header>

      <section id="typography" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Typography
        </h2>
        <div class="flex flex-col gap-2">
          <h1 class="text-4xl font-semibold text-highlighted">
            Heading 1
          </h1>
          <h2 class="text-3xl font-semibold text-highlighted">
            Heading 2
          </h2>
          <h3 class="text-2xl font-semibold text-highlighted">
            Heading 3
          </h3>
          <h4 class="text-xl font-semibold text-highlighted">
            Heading 4
          </h4>
          <h5 class="text-lg font-semibold text-highlighted">
            Heading 5
          </h5>
          <h6 class="text-base font-semibold text-highlighted">
            Heading 6
          </h6>
        </div>
        <p class="mt-4 text-lg text-muted">
          This is a lead paragraph. It stands out from regular paragraphs.
        </p>
        <p class="mt-3 text-default">
          Body copy sits on the default text role. You can use it for a paragraph you read at length.
        </p>
        <p class="mt-3 text-muted">
          Muted text is for secondary lines and supporting detail.
        </p>
        <p class="mt-3 text-dimmed">
          Dimmed text is the quietest role on the canvas.
        </p>
        <p class="mt-3 text-default">
          Inline <strong class="text-highlighted">bold</strong> and <em>italic</em> emphasis in body copy.
        </p>
        <blockquote class="mt-4 border-s-4 border-default ps-4 text-muted">
          A well-known quote, contained in a blockquote.
        </blockquote>
        <ul class="mt-4 list-disc ps-5 text-default">
          <li>First item.</li>
          <li>Second item.</li>
          <li>Third item.</li>
        </ul>
      </section>

      <section id="buttons" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Buttons
        </h2>
        <div
          v-for="variant in buttonVariants"
          :key="variant"
          class="mb-3 flex flex-wrap items-center gap-2"
        >
          <span class="w-16 shrink-0 text-xs capitalize text-dimmed">{{ variant }}</span>
          <UButton
            v-for="color in buttonColors"
            :key="`${variant}-${color}`"
            :color="color"
            :variant="variant"
            :label="colorLabel(color)"
          />
        </div>
      </section>

      <section id="badges" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Badges
        </h2>
        <div class="mb-3 flex flex-wrap gap-2">
          <UBadge
            v-for="color in buttonColors"
            :key="`badge-${color}`"
            :color="color"
            :label="colorLabel(color)"
          />
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="color in buttonColors"
            :key="`badge-subtle-${color}`"
            :color="color"
            variant="subtle"
            :label="colorLabel(color)"
          />
        </div>
      </section>

      <section id="alerts" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Alerts
        </h2>
        <div class="flex flex-col gap-3">
          <UAlert
            color="info"
            variant="subtle"
            title="Info"
            description="A quiet notice with supporting detail."
          />
          <UAlert
            color="success"
            variant="subtle"
            title="Success"
            description="Something finished without errors."
          />
          <UAlert
            color="warning"
            variant="subtle"
            title="Warning"
            description="Review this before you continue."
          />
          <UAlert
            color="error"
            variant="subtle"
            title="Error"
            description="This action could not be completed."
          />
          <UAlert
            color="primary"
            variant="subtle"
            title="Well Done"
            description="A longer alert so you can see spacing, title weight, and body text together."
          />
        </div>
      </section>

      <section id="cards" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Cards
        </h2>
        <div class="grid gap-4 sm:grid-cols-3">
          <UCard
            title="Card Title"
            description="Some quick example text to build on the card title."
          />
          <UCard
            title="Card Title"
            description="Some quick example text to build on the card title."
          />
          <UCard
            title="Card Title"
            description="Some quick example text to build on the card title."
          />
        </div>
      </section>

      <section id="tables" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Tables
        </h2>
        <UTable :data="people" :columns="columns" />
      </section>

      <section id="forms" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Forms
        </h2>
        <form class="flex max-w-md flex-col gap-4" @submit.prevent>
          <UFormField label="Name">
            <UInput v-model="name" placeholder="Ada Lovelace" class="w-full" />
          </UFormField>
          <UFormField label="Email">
            <UInput v-model="email" type="email" placeholder="ada@example.com" class="w-full" />
          </UFormField>
          <UFormField label="Role">
            <USelect v-model="role" :items="roles" class="w-full" />
          </UFormField>
          <UFormField label="Note">
            <UTextarea placeholder="A short note" :rows="3" class="w-full" />
          </UFormField>
          <UFormField label="Disabled">
            <UInput model-value="Read only" disabled class="w-full" />
          </UFormField>
          <URadioGroup v-model="choice" :items="radioItems" />
          <UCheckbox v-model="agree" label="I agree" />
          <USwitch v-model="updates" label="Send updates" />
        </form>
      </section>

      <section id="navs" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Navs
        </h2>
        <UTabs :items="tabs" class="w-full" />
      </section>

      <section id="breadcrumb" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Breadcrumb
        </h2>
        <UBreadcrumb :items="crumbs" />
      </section>

      <section id="accordion" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Accordion
        </h2>
        <UAccordion :items="accordion" />
      </section>

      <section id="progress" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Progress
        </h2>
        <div class="flex flex-col gap-3">
          <UProgress :model-value="25" color="primary" class="w-full" />
          <UProgress :model-value="50" color="success" class="w-full" />
          <UProgress :model-value="75" color="warning" class="w-full" />
          <UProgress :model-value="90" color="error" class="w-full" />
        </div>
      </section>

      <section id="pagination" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Pagination
        </h2>
        <UPagination v-model:page="page" :total="100" />
      </section>

      <section id="dropdown" class="scroll-mt-24">
        <h2 class="sticky top-0 z-10 -mx-1 mb-4 border-b border-default bg-default/95 px-1 py-3 text-lg font-semibold text-highlighted backdrop-blur">
          Dropdown
        </h2>
        <UDropdownMenu :items="menuItems">
          <UButton label="Menu" color="neutral" variant="outline" />
        </UDropdownMenu>
      </section>
    </div>

    <aside class="hidden w-44 shrink-0 lg:block">
      <nav class="sticky top-6" aria-label="On This Page">
        <p class="mb-3 text-xs font-semibold text-dimmed">
          On This Page
        </p>
        <ul class="flex flex-col gap-1.5 text-sm">
          <li v-for="section in sections" :key="section.id">
            <a
              :href="`#${section.id}`"
              class="block rounded px-2 py-1"
              :class="activeId === section.id ? 'bg-elevated font-medium text-highlighted' : 'text-muted hover:text-highlighted'"
            >
              {{ section.label }}
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>
