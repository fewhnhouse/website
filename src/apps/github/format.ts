import type { MouseEvent } from 'react'

import type { ContributionDay } from './types'

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en').format(value)
}

export function formatGithubCompany(company: string | null) {
  if (!company) return null

  if (company.toLowerCase().includes('pricenow')) return 'Pricenow'

  return company.replace(/^@/, '')
}

export function formatGithubLocation(location: string | null) {
  if (!location) return null

  return location.replace('Zürich', 'Zurich')
}

export function openExternalLink(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
  event.stopPropagation()
  window.open(event.currentTarget.href, '_blank', 'noopener,noreferrer')
}

export function contributionLevel(count: number) {
  if (count === 0) return 0
  if (count < 3) return 1
  if (count < 7) return 2
  if (count < 14) return 3
  return 4
}

export function buildContributionCalendar(days: ContributionDay[]) {
  const calendarDays = days.length > 0 ? days : []
  const monthLabels: { label: string; column: number }[] = []
  let previousMonth = ''

  calendarDays.forEach((day, index) => {
    const date = new Date(`${day.date}T00:00:00`)
    const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date)

    if (month !== previousMonth) {
      const column = Math.floor(index / 7)

      if (column > 0) {
        monthLabels.push({ label: month, column })
      }

      previousMonth = month
    }
  })

  const paddedDays = [...calendarDays]

  while (paddedDays.length < 371) {
    paddedDays.push({
      contributionCount: 0,
      date: `placeholder-${paddedDays.length}`,
    })
  }

  return {
    days: paddedDays.slice(0, 371),
    monthLabels,
  }
}
