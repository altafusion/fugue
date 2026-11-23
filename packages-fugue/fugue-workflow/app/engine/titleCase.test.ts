import { describe, expect, it } from 'vitest'
import { isTitleCase } from './titleCase'

describe('isTitleCase', () => {
  it('accepts workflow step titles', () => {
    const titles = [
      'What Would You Like to Deploy?',
      'What Are You Deploying?',
      'Choose a Workload',
      'Configure & Deploy',
      'Where Is Your Code or Image?',
      'What Kind of Service Is This?',
      'Classification & Sensitivity',
      'Connect to Other Deployments',
      'Set Up & Launch',
      'Security Selection',
      'GitHub Source',
      'Select Your Region(s)',
      'Python App',
      'Language & Runtime',
      'Runtime Configuration',
      'Repository Details',
      'Link to a Project',
      'Authentication',
    ]

    for (const title of titles)
      expect(isTitleCase(title), title).toBe(true)
  })

  it('rejects sentence-case titles', () => {
    const titles = [
      'What are you deploying?',
      'Choose a workload',
      'Configure & deploy',
      'Classification & sensitivity',
      'Set up & launch',
      'GitHub source',
      'Repository details',
      'Link to a project',
    ]

    for (const title of titles)
      expect(isTitleCase(title), title).toBe(false)
  })

  it('accepts branded proper nouns mid-title', () => {
    const titles = [
      'Deploy to macOS',
      'Configure for iOS and iPadOS',
      'Build for watchOS',
      'Deploy with Docker',
    ]

    for (const title of titles)
      expect(isTitleCase(title), title).toBe(true)
  })

  it('accepts standalone acronyms', () => {
    expect(isTitleCase('Configure the API')).toBe(true)
    expect(isTitleCase('URL Configuration')).toBe(true)
    expect(isTitleCase('Export to JSON')).toBe(true)
  })

  it('ignores punctuation-only tokens without consuming the first-word slot', () => {
    expect(isTitleCase('- Deploy')).toBe(true)
    expect(isTitleCase('- deploy')).toBe(false)
  })

  it('handles accented (non-ASCII) letters without stripping them', () => {
    expect(isTitleCase('Étape Un')).toBe(true)
    expect(isTitleCase('étape un')).toBe(false)
  })

  it('rejects wrong-cased branded terms', () => {
    expect(isTitleCase('Deploy to Macos')).toBe(false)
    expect(isTitleCase('Deploy to MACOS')).toBe(false)
  })

  it('rejects empty or whitespace-only titles', () => {
    expect(isTitleCase('')).toBe(false)
    expect(isTitleCase('   ')).toBe(false)
  })

  it('accepts hyphenated compounds with Chicago-style segment casing', () => {
    expect(isTitleCase('Third-Party Integration')).toBe(true)
    expect(isTitleCase('Configure Sign-in')).toBe(true)
    expect(isTitleCase('State-of-the-Art Configuration')).toBe(true)
  })

  it('rejects wrong-cased hyphenated compounds', () => {
    expect(isTitleCase('third-party integration')).toBe(false)
    expect(isTitleCase('Sign-In')).toBe(false)
    expect(isTitleCase('State-Of-The-Art')).toBe(false)
  })

  it('preserves ampersand handling with hyphenated words', () => {
    expect(isTitleCase('Configure & Sign-in')).toBe(true)
    expect(isTitleCase('Configure & sign-in')).toBe(false)
  })

  it('accepts symbol-bearing brand tokens with exact canonical casing', () => {
    expect(isTitleCase('Deploy to C++ Runtime')).toBe(true)
    expect(isTitleCase('Deploy a .NET App')).toBe(true)
    expect(isTitleCase('Node.js Source')).toBe(true)
  })

  it('rejects mis-cased symbol-bearing brand tokens', () => {
    expect(isTitleCase('Deploy a .Net App')).toBe(false)
    expect(isTitleCase('Deploy to c++ Runtime')).toBe(false)
  })

  it('still accepts hyphenated compounds after symbol-term handling', () => {
    expect(isTitleCase('Third-Party Integration')).toBe(true)
    expect(isTitleCase('Configure Sign-in')).toBe(true)
  })

  it('rejects mis-cased symbol terms with trailing sentence punctuation', () => {
    expect(isTitleCase('Deploy a .Net?')).toBe(false)
    expect(isTitleCase('Learning nOdE.js')).toBe(false)
    expect(isTitleCase('Deploy to c++!')).toBe(false)
  })

  it('accepts symbol terms with trailing sentence punctuation when canonically cased', () => {
    expect(isTitleCase('Is It .NET?')).toBe(true)
    expect(isTitleCase('Node.js, Python, and Docker')).toBe(true)
    expect(isTitleCase('Deploy to C++!')).toBe(true)
  })

  it('skips punctuation-only tokens after trailing symbol-term trim', () => {
    expect(isTitleCase('Deploy ... Now')).toBe(true)
    expect(isTitleCase('Deploy ... now')).toBe(false)
  })
})
