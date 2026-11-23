import type { HandlerRegistry, WorkflowContext } from '../types/workflow'

type Token
  = | { type: 'ident', value: string }
    | { type: 'string', value: string }
    | { type: 'number', value: number }
    | { type: 'bool', value: boolean }
    | { type: 'null', value: null }
    | { type: 'op', value: '==' | '!=' | '&&' | '||' | '!' | '(' | ')' }

function tokenize(expr: string): Token[] | null {
  const tokens: Token[] = []
  let i = 0

  while (i < expr.length) {
    const ch = expr[i]!
    if (/\s/.test(ch)) {
      i++
      continue
    }

    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }

    if (ch === '!' && expr[i + 1] !== '=') {
      tokens.push({ type: 'op', value: '!' })
      i++
      continue
    }

    if (ch === '&' && expr[i + 1] === '&') {
      tokens.push({ type: 'op', value: '&&' })
      i += 2
      continue
    }

    if (ch === '|' && expr[i + 1] === '|') {
      tokens.push({ type: 'op', value: '||' })
      i += 2
      continue
    }

    if (ch === '=' && expr[i + 1] === '=') {
      tokens.push({ type: 'op', value: '==' })
      i += 2
      continue
    }

    if (ch === '!' && expr[i + 1] === '=') {
      tokens.push({ type: 'op', value: '!=' })
      i += 2
      continue
    }

    if (ch === '\'' || ch === '"') {
      const quote = ch
      i++
      let value = ''
      while (i < expr.length && expr[i] !== quote) {
        if (expr[i] === '\\' && i + 1 < expr.length) {
          const next = expr[i + 1]!
          value += next === quote || next === '\\'
            ? next
            : expr[i]! + next
          i += 2
          continue
        }
        value += expr[i]
        i++
      }
      if (expr[i] !== quote)
        return null
      i++
      tokens.push({ type: 'string', value })
      continue
    }

    // Number literal, incl. a leading `-` when it immediately precedes a digit/dot
    // (there is no subtraction operator in this DSL, so `-` is only ever a sign).
    if (/[\d.]/.test(ch) || (ch === '-' && /[\d.]/.test(expr[i + 1] ?? ''))) {
      let num = ''
      if (ch === '-')
        num += expr[i++]
      while (i < expr.length && /[\d.]/.test(expr[i]!))
        num += expr[i++]
      const parsed = Number(num)
      if (Number.isNaN(parsed))
        return null
      tokens.push({ type: 'number', value: parsed })
      continue
    }

    if (/[A-Z_]/i.test(ch)) {
      let ident = ''
      // Allow dots so dotted context keys (stored flat, e.g. `disclosureTier.selected`)
      // tokenize as one identifier instead of stalling the lexer.
      while (i < expr.length && /[\w.]/.test(expr[i]!))
        ident += expr[i++]
      if (ident === 'true' || ident === 'false')
        tokens.push({ type: 'bool', value: ident === 'true' })

      else if (ident === 'null')
        tokens.push({ type: 'null', value: null })

      else
        tokens.push({ type: 'ident', value: ident })

      continue
    }

    return null
  }

  return tokens
}

function truthy(value: unknown): boolean {
  return Boolean(value)
}

/**
 * Tiny, SAFE predicate DSL over Context.
 * Identifiers, literals, == != && || !, parentheses. Unknown identifiers → undefined.
 */
type OpValue = Extract<Token, { type: 'op' }>['value']

export function evaluateGuard(expr: string, ctx: WorkflowContext): boolean {
  const tokens = tokenize(expr.trim())
  if (!tokens || tokens.length === 0)
    return false

  const toks: Token[] = tokens
  let pos = 0

  function peek(): Token | undefined {
    return toks[pos]
  }

  function consume(): Token | undefined {
    return toks[pos++]
  }

  function matchOp(...ops: OpValue[]): boolean {
    const token = peek()
    if (token?.type === 'op' && ops.includes(token.value)) {
      pos++
      return true
    }
    return false
  }

  function parseOr(): boolean {
    let left = parseAnd()
    while (matchOp('||')) {
      const right = parseAnd()
      left = left || right
    }
    return left
  }

  function parseAnd(): boolean {
    let left = parseEquality()
    while (matchOp('&&')) {
      const right = parseEquality()
      left = left && right
    }
    return left
  }

  function parseEquality(): boolean {
    const left = parseUnary()
    if (matchOp('==')) {
      const right = parseUnary()
      return left === right
    }
    if (matchOp('!=')) {
      const right = parseUnary()
      return left !== right
    }
    return truthy(left)
  }

  function parseUnary(): unknown {
    if (matchOp('!'))
      return !truthy(parseUnary())
    return parsePrimary()
  }

  function parsePrimary(): unknown {
    const token = consume()
    if (!token)
      throw new Error('Syntax error: unexpected end of expression')

    if (token.type === 'ident') {
      return Object.hasOwn(ctx, token.value)
        ? ctx[token.value]
        : undefined
    }
    if (token.type === 'string' || token.type === 'number' || token.type === 'bool' || token.type === 'null')
      return token.value

    if (token.type === 'op' && token.value === '(') {
      const result = parseOr()
      if (!matchOp(')'))
        throw new Error('Syntax error: unclosed parenthesis')
      return result
    }

    throw new Error('Syntax error: unexpected token')
  }

  try {
    const result = parseOr()
    if (pos < toks.length)
      return false
    return truthy(result)
  } catch {
    return false
  }
}

/** Evaluate a `when` guard (registry handler id or DSL string) against Context. */
export function evaluateWhen(
  when: string,
  ctx: WorkflowContext,
  registry: HandlerRegistry,
): boolean {
  if (registry.guards && Object.hasOwn(registry.guards, when)) {
    // Fail closed like the DSL path: a throwing custom guard must not crash the engine.
    try {
      return registry.guards[when]!(ctx)
    } catch {
      return false
    }
  }
  return evaluateGuard(when, ctx)
}
