const PROPER_NOUNS = new Map<string, string>([
  ['github', 'GitHub'],
  ['python', 'Python'],
  ['docker', 'Docker'],
  // Platform names keep their intentional casing even mid-title.
  ['macos', 'macOS'],
  ['ios', 'iOS'],
  ['ipados', 'iPadOS'],
  ['tvos', 'tvOS'],
  ['watchos', 'watchOS'],
  ['visionos', 'visionOS'],
])

/** Brand tokens whose canonical casing includes symbols — matched on the raw token before punctuation strip. */
const SYMBOL_TERMS = new Map<string, string>([
  ['c++', 'C++'],
  ['.net', '.NET'],
  ['node.js', 'Node.js'],
  ['f#', 'F#'],
  ['c#', 'C#'],
])

/** Articles, short conjunctions, and short prepositions — lowercase unless first/last or after `&`. */
const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'nor',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'as',
])

function capitalizeWord(word: string): string {
  if (!word)
    return word
  const chars = [...word]
  return `${chars[0]?.toUpperCase()}${chars.slice(1).join('').toLowerCase()}`
}

function isStandaloneAcronym(word: string, lower: string, proper: string | undefined): boolean {
  return proper === undefined
    && word.length > 1
    && /\p{Lu}/u.test(word)
    && word === word.toUpperCase()
}

function expectedWordForm(
  segment: string,
  segIndex: number,
  segmentCount: number,
  wordIndex: number,
  totalWords: number,
  afterAmp: boolean,
): string {
  const lower = segment.toLowerCase()
  const proper = PROPER_NOUNS.get(lower)

  if (isStandaloneAcronym(segment, lower, proper))
    return segment

  const isFirstWord = wordIndex === 0
  const isLastWord = wordIndex === totalWords - 1
  const isFirstSegment = segIndex === 0

  let shouldCapitalize: boolean
  if (segmentCount === 1) {
    shouldCapitalize = isFirstWord || isLastWord || afterAmp || !STOP_WORDS.has(lower)
  } else {
    if (isFirstSegment)
      shouldCapitalize = true
    else
      shouldCapitalize = !STOP_WORDS.has(lower)
  }

  return proper ?? (shouldCapitalize
    ? capitalizeWord(segment)
    : lower)
}

function wordMatchesExpected(
  word: string,
  wordIndex: number,
  totalWords: number,
  afterAmp: boolean,
): boolean {
  const segments = word.split('-')
  const expected = segments
    .map((segment, segIndex) =>
      expectedWordForm(segment, segIndex, segments.length, wordIndex, totalWords, afterAmp),
    )
    .join('-')
  return word === expected
}

/**
 * Title case for workflow step titles — simplified Chicago rules used for wizard titles and product UI copy.
 * Capitalize the first and last word, major words, words after `&`, and known proper nouns;
 * lowercase articles, short conjunctions, and short prepositions in the middle.
 */
export function isTitleCase(title: string): boolean {
  if (!title.trim())
    return false

  const tokens = title.trim().split(/\s+/)
  const words: string[] = []
  const afterAmpersand: boolean[] = []

  let pendingAmpersand = false
  for (const token of tokens) {
    if (token === '&') {
      pendingAmpersand = true
      continue
    }

    const symbolCandidate = token.replace(/[.,;:!?]+$/u, '')
    const symbolCanonical = SYMBOL_TERMS.get(symbolCandidate.toLowerCase())
    if (symbolCanonical !== undefined) {
      if (symbolCandidate !== symbolCanonical)
        return false

      words.push(symbolCandidate)
      afterAmpersand.push(pendingAmpersand)
      pendingAmpersand = false
      continue
    }

    // Unicode-aware punctuation strip so accented letters (É, ñ, …) aren't treated as punctuation.
    const word = token.replace(/^[^\p{L}\p{N}]+/u, '').replace(/[^\p{L}\p{N}]+$/u, '')
    if (!word)
      continue

    words.push(word)
    afterAmpersand.push(pendingAmpersand)
    pendingAmpersand = false
  }

  if (words.length === 0)
    return false

  for (let i = 0; i < words.length; i++) {
    const canonical = SYMBOL_TERMS.get(words[i]!.toLowerCase())
    if (canonical !== undefined) {
      if (words[i] !== canonical)
        return false
      continue
    }

    if (!wordMatchesExpected(words[i]!, i, words.length, afterAmpersand[i] ?? false))
      return false
  }

  return true
}
