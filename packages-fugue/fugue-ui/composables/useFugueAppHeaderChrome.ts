/** Shared scroll + mobile drawer state for landing header visual styles. */
export function useFugueAppHeaderChrome() {
  const navOpen = ref(false)
  const scrolled = ref(false)

  function onScroll() {
    scrolled.value = window.scrollY >= 50
  }

  onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  function closeNav() {
    navOpen.value = false
  }

  function toggleNav() {
    navOpen.value = !navOpen.value
  }

  return {
    navOpen,
    scrolled,
    closeNav,
    toggleNav,
  }
}
