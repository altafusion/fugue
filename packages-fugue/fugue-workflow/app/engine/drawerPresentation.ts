import type { DrawerConfig, DrawerSide, StepConfig, WorkflowConfig } from '../types/workflow'

export const DEFAULT_DRAWER_SIDE: DrawerSide = 'right'

export type ResolvedDrawerConfig = Required<DrawerConfig>

/**
 * Precedence: step `drawer` → workflow `drawer` → engine default. Each key resolves
 * independently, so a step can override the side while inheriting `relocatable`.
 */
export function resolveDrawerConfig(
  config: Pick<WorkflowConfig, 'drawer'>,
  step?: StepConfig,
): ResolvedDrawerConfig {
  return {
    side: step?.drawer?.side ?? config.drawer?.side ?? DEFAULT_DRAWER_SIDE,
    relocatable: step?.drawer?.relocatable ?? config.drawer?.relocatable ?? false,
  }
}
