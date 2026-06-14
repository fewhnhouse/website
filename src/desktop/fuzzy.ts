// Tiny dependency-free fuzzy matcher. Returns a score plus the matched
// character ranges in `title` so callers can highlight the substrings.
// Higher score = better match.

export type FuzzyMatch = {
  score: number
  ranges: Array<[number, number]>
}

// Subsequence match against a single string. Rewards consecutive runs, matches
// at word boundaries, and earlier matches.
function matchString(query: string, target: string): FuzzyMatch | null {
  if (!query) return { score: 0, ranges: [] }

  const haystack = target.toLowerCase()
  const ranges: Array<[number, number]> = []

  let score = 0
  let queryIndex = 0
  let lastMatch = -2
  let runStart = -1

  for (let i = 0; i < haystack.length && queryIndex < query.length; i += 1) {
    if (haystack[i] !== query[queryIndex]) continue

    let charScore = 1
    if (i === lastMatch + 1) charScore += 4 // consecutive run
    if (i === 0 || /[\s/.\-_]/.test(haystack[i - 1])) charScore += 3 // word boundary
    score += charScore

    if (runStart === -1) runStart = i
    if (i !== lastMatch + 1 && runStart !== i) {
      ranges.push([runStart, lastMatch + 1])
      runStart = i
    }

    lastMatch = i
    queryIndex += 1
  }

  if (queryIndex < query.length) return null

  if (runStart !== -1) ranges.push([runStart, lastMatch + 1])

  // Prefer shorter targets and earlier first matches.
  score -= haystack.length * 0.02
  if (ranges.length) score -= ranges[0][0] * 0.1

  return { score, ranges }
}

// Match against a primary title (ranges returned for highlighting) plus extra
// keyword strings (contribute to score only). The best title match wins for
// highlighting; keyword matches still let an item surface.
export function fuzzyMatch(
  query: string,
  title: string,
  keywords: string[],
): FuzzyMatch | null {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return { score: 0, ranges: [] }

  const titleMatch = matchString(normalized, title)

  let bestKeywordScore = -Infinity
  for (const keyword of keywords) {
    const match = matchString(normalized, keyword)
    if (match && match.score > bestKeywordScore) bestKeywordScore = match.score
  }

  if (titleMatch) {
    // Title matches get a bonus so they outrank keyword-only matches.
    const keywordBoost = bestKeywordScore > 0 ? bestKeywordScore * 0.3 : 0
    return { score: titleMatch.score + 5 + keywordBoost, ranges: titleMatch.ranges }
  }

  if (bestKeywordScore > -Infinity) {
    return { score: bestKeywordScore, ranges: [] }
  }

  return null
}
