import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionBadge } from './section-badge'

describe('SectionBadge', () => {
  describe('when complete', () => {
    it('renders a checkmark icon', () => {
      render(<SectionBadge complete={true} />)

      // The checkmark is an SVG with a specific path
      const badge = screen.getByTitle('Section complete')
      expect(badge).toBeInTheDocument()
    })

    it('has correct aria-label', () => {
      render(<SectionBadge complete={true} />)

      const badge = screen.getByLabelText('Section complete')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('when incomplete', () => {
    it('renders missing count text', () => {
      render(<SectionBadge complete={false} missingCount={3} />)

      expect(screen.getByText('3 missing')).toBeInTheDocument()
    })

    it('has correct aria-label with plural', () => {
      render(<SectionBadge complete={false} missingCount={3} />)

      const badge = screen.getByLabelText('3 fields missing')
      expect(badge).toBeInTheDocument()
    })

    it('has correct aria-label with singular', () => {
      render(<SectionBadge complete={false} missingCount={1} />)

      const badge = screen.getByLabelText('1 field missing')
      expect(badge).toBeInTheDocument()
    })

    it('renders nothing when missingCount is 0', () => {
      const { container } = render(<SectionBadge complete={false} missingCount={0} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('renders nothing when complete is false and no missingCount provided', () => {
      const { container } = render(<SectionBadge complete={false} />)

      expect(container.firstChild).toBeNull()
    })

    it('applies custom className', () => {
      render(<SectionBadge complete={true} className="custom-class" />)

      const badge = screen.getByTitle('Section complete')
      expect(badge).toHaveClass('custom-class')
    })
  })
})
