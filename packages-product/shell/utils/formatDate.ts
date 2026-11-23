/**
 * formatDate – a utility shared across product apps via the @altafusion/shell layer.
 *
 * Files placed in `packages-product/shell/utils/` are auto-imported by every app
 * that extends this layer, just like composables.
 */
export function formatDate(
  date: Date | string | number,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date))
}
