export interface FugueContentLandingSectionNav {
  labelKey?: string
  label?: string
  icon?: string
  id?: string
  /** Locale-neutral path — defaults to `/` for `home` anchor, else `/#{anchor}` */
  to?: string
}

/** Named landing section component with props nested under the component definition. */
export interface FugueContentLandingSectionComponent {
  name: string
  props?: Record<string, unknown>
}

export interface FugueContentLandingSection {
  /** Fragment file stem when using `FugueContentFragment` — e.g. `hero` → `fragments/hero.md` */
  slug: string
  /** DOM id for hash navigation — e.g. `activities` → `#activities` */
  anchor: string
  /** Vue component — string shorthand or `{ name, props }` */
  component?: string | FugueContentLandingSectionComponent
  /** Optional wrapper `<section>` base class — overrides `FugueContentLandingPage` `sectionClass` */
  sectionClass?: string
  /** Optional layout variant — appended as `{sectionClass}--{variant}` */
  variant?: string
  nav?: FugueContentLandingSectionNav
}

export interface FugueContentLandingManifest {
  sections: FugueContentLandingSection[]
}

export interface FugueContentLandingNavItem {
  label: string
  labelKey?: string
  icon: string
  id?: string
  to: string
}

/** Default hash/home path for a landing section nav entry. */
export function landingSectionNavPath(section: FugueContentLandingSection): string {
  if (section.nav?.to)
    return section.nav.to
  if (section.anchor === 'home')
    return '/'
  return `/#${section.anchor}`
}

/** Build shell nav items from a landing manifest (sections with `nav` only). */
export function landingNavItems(
  sections: FugueContentLandingSection[] | undefined,
  localePath: (path: string) => string = path => path
): FugueContentLandingNavItem[] {
  if (!sections?.length)
    return []

  return sections
    .filter(section => section.nav)
    .map((section) => {
      const nav = section.nav!
      return {
        label: nav.label ?? section.anchor,
        labelKey: nav.labelKey,
        icon: nav.icon ?? 'i-lucide-circle',
        id: nav.id ?? section.anchor,
        to: localePath(landingSectionNavPath(section))
      }
    })
}

/** Resolved Vue component name for a landing section row. */
export function landingSectionComponentName(section: FugueContentLandingSection): string {
  const component = section.component
  if (typeof component === 'string')
    return component || 'FugueContentFragment'
  if (component && typeof component === 'object')
    return component.name
  return 'FugueContentFragment'
}

function landingSectionComponentRawProps(section: FugueContentLandingSection): Record<string, unknown> {
  const component = section.component
  if (component && typeof component === 'object' && component.props)
    return { ...component.props }
  return {}
}

/** Props for a dynamic section component — `FugueContentFragment` always receives `slug`. */
export function landingSectionProps(section: FugueContentLandingSection): Record<string, unknown> {
  const component = landingSectionComponentName(section)
  const props = landingSectionComponentRawProps(section)

  if (component === 'FugueContentFragment')
    props.slug = section.slug
  else if (
    !props.slug
    && !props.contentComponent
    && (
      'images' in props
      || ('src' in props && 'alt' in props)
      || component.endsWith('Fragment')
    )
  )
    props.slug = section.slug

  return props
}

/** Base BEM block class for a landing `<section>` — manifest row overrides page default. */
export function landingSectionClass(
  section: FugueContentLandingSection,
  defaultSectionClass: string
): string {
  return section.sectionClass ?? defaultSectionClass
}

/** Wrapper `<section>` class list — base class plus optional `{base}--{variant}`. */
export function landingSectionClasses(
  section: FugueContentLandingSection,
  defaultSectionClass: string
): string[] {
  const base = landingSectionClass(section, defaultSectionClass)
  const classes = [base]
  if (section.variant)
    classes.push(`${base}--${section.variant}`)
  return classes
}
