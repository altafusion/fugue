<script setup lang="ts">
interface KeyValueRow {
  id: string
  key: string
  value: string
}

const props = defineProps<{
  modelValue: unknown
  disabled?: boolean
  highlighted?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

let nextRowId = 0

function createRowId(): string {
  nextRowId += 1
  return `kv-${nextRowId}`
}

function createRow(key = '', value = ''): KeyValueRow {
  return {
    id: createRowId(),
    key,
    value,
  }
}

function recordFromModelValue(value: unknown): Record<string, string> {
  if (value === null || value === undefined || typeof value !== 'object' || Array.isArray(value))
    return Object.create(null)
  const record: Record<string, string> = Object.create(null)
  for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
    if (entryValue === null || entryValue === undefined)
      continue
    record[key] = String(entryValue)
  }
  return record
}

function buildRecord(rows: KeyValueRow[]): Record<string, string> {
  const record: Record<string, string> = Object.create(null)
  for (const row of rows) {
    const trimmedKey = row.key.trim()
    if (!trimmedKey)
      continue
    record[trimmedKey] = row.value
  }
  return record
}

function recordsEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const aKeys = Object.keys(a)
  if (aKeys.length !== Object.keys(b).length)
    return false
  for (const key of aKeys) {
    if (a[key] !== b[key])
      return false
  }
  return true
}

const rows = ref<KeyValueRow[]>([])

function syncRowsFromProp(value: unknown) {
  const incoming = recordFromModelValue(value)
  const rowByKey = new Map<string, KeyValueRow>()
  for (const row of rows.value) {
    const trimmedKey = row.key.trim()
    if (trimmedKey && !rowByKey.has(trimmedKey))
      rowByKey.set(trimmedKey, row)
  }

  const usedRowIds = new Set<string>()
  const nextRows: KeyValueRow[] = []

  for (const [key, entryValue] of Object.entries(incoming)) {
    const existing = rowByKey.get(key)
    if (existing && !usedRowIds.has(existing.id)) {
      usedRowIds.add(existing.id)
      nextRows.push(existing.key === key && existing.value === entryValue
        ? existing
        : { ...existing, key, value: entryValue })
    } else {
      nextRows.push(createRow(key, entryValue))
    }
  }

  rows.value = nextRows
}

syncRowsFromProp(props.modelValue)

watch(() => props.modelValue, (value) => {
  const incoming = recordFromModelValue(value)
  if (recordsEqual(incoming, buildRecord(rows.value)))
    return
  syncRowsFromProp(value)
}, { deep: true })

function emitRecord(nextRows: KeyValueRow[]) {
  rows.value = nextRows
  emit('update:modelValue', buildRecord(nextRows))
}

function updateRow(rowId: string, patch: Partial<Pick<KeyValueRow, 'key' | 'value'>>) {
  emitRecord(rows.value.map(row => row.id === rowId
    ? {
        ...row,
        ...patch,
      }
    : row))
}

function addRow() {
  emitRecord([
    ...rows.value,
    createRow(),
  ])
}

function removeRow(rowId: string) {
  emitRecord(rows.value.filter(row => row.id !== rowId))
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="row in rows"
      :key="row.id"
      class="flex flex-wrap items-start gap-2"
    >
      <UInput
        :model-value="row.key"
        placeholder="Key"
        :disabled="disabled"
        :highlight="highlighted"
        class="min-w-0 flex-1"
        data-testid="key-value-key"
        @update:model-value="updateRow(row.id, { key: String($event ?? '') })"
      />
      <UInput
        :model-value="row.value"
        placeholder="Value"
        :disabled="disabled"
        :highlight="highlighted"
        class="min-w-0 flex-1"
        data-testid="key-value-value"
        @update:model-value="updateRow(row.id, { value: String($event ?? '') })"
      />
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-trash-2"
        aria-label="Remove row"
        :disabled="disabled"
        data-testid="key-value-remove"
        @click="removeRow(row.id)"
      />
    </div>

    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-plus"
      label="Add row"
      :disabled="disabled"
      data-testid="key-value-add"
      @click="addRow"
    />
  </div>
</template>
