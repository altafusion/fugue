<script setup lang="ts">
/**
 * Default step body for the wizard shell.
 *
 * Renders whatever the step declares: visible inputs → optional footer note →
 * actions. No whole-form swap / custom step body here — that would be a future
 * `body.component` path. Empty steps (no inputs, no actions) surface the alert.
 *
 * Shell builds `view` (WorkflowStepView); this component stays presentational.
 */
import type { WorkflowStepView } from '../types/workflowStepView'
import { WIZARD_STICKY_FOOTER_CLASS } from '../theme'

defineProps<{
  view: WorkflowStepView
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Genuine dead end (e.g. guards hid all declared fields), not a terminal screen -->
    <UAlert
      v-if="view.shouldWarnEmpty"
      color="warning"
      variant="subtle"
      title="Nothing to display"
      description="This step has no fields or actions to display. It may be misconfigured or missing a handler."
    />

    <!-- Declarative fields (incl. registry composites). `when` already applied → stepInputs. -->
    <!-- Pending field `validate:` must not disable inputs — that blurs focused text fields. -->
    <WorkflowWizardFields
      :inputs="view.stepInputs"
      :groups="view.currentStep?.groups"
      :values="view.values"
      :context="view.context"
      :field-errors="view.fieldErrors"
      :field-options="view.fieldOptions"
      :effects="view.effects"
      :is-busy="view.isInputBusy"
      :components="view.components"
      @update="view.setValue"
      @ready="view.setCompositeReady"
      @error="view.setFieldError"
    />

    <!-- Optional step.footer.note — below fields, above action row -->
    <p
      v-if="view.currentStep?.footer?.note"
      class="flex gap-2 text-sm text-muted"
    >
      <UIcon
        name="i-lucide-info"
        class="size-4 shrink-0 mt-0.5"
      />
      <span>
        <span class="font-medium text-default">Note:</span>
        {{ view.currentStep.footer.note }}
      </span>
    </p>

    <!-- Back / continue / named actions (Deploy, etc.) -->
    <div
      :class="view.stickyFooter !== false
        ? WIZARD_STICKY_FOOTER_CLASS
        : undefined"
    >
      <WorkflowWizardActions
        :current-step="view.currentStep"
        :show-back="view.showBack"
        :is-busy="view.isBusy"
        :effects="view.effects"
        :advance="view.advance"
        :back="view.back"
        :run-action="view.runAction"
        :bordered="view.stickyFooter === false"
      />
    </div>
  </div>
</template>
