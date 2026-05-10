// @vitest-environment jsdom

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RenderedMarkdown } from './RenderedMarkdown'

describe('RenderedMarkdown', () => {
  it('preserves multiple blank source lines as preview spacing', () => {
    const { container } = render(<RenderedMarkdown markdown={'First\n\n\n\nSecond'} />)

    const spacer = container.querySelector('.felix-mdx-blank-lines')

    expect(spacer).not.toBeNull()
    expect(spacer?.getAttribute('style')).toContain('--blank-lines: 3')
  })
})
