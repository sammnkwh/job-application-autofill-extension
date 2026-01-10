import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SegmentedProgress, getThreshold, THRESHOLDS } from './segmented-progress'

describe('SegmentedProgress', () => {
  describe('getThreshold', () => {
    it('returns "Getting Started" for 0-25%', () => {
      expect(getThreshold(0).label).toBe('Getting Started')
      expect(getThreshold(10).label).toBe('Getting Started')
      expect(getThreshold(25).label).toBe('Getting Started')
    })

    it('returns "Good" for 26-50%', () => {
      expect(getThreshold(26).label).toBe('Good')
      expect(getThreshold(40).label).toBe('Good')
      expect(getThreshold(50).label).toBe('Good')
    })

    it('returns "Strong" for 51-75%', () => {
      expect(getThreshold(51).label).toBe('Strong')
      expect(getThreshold(60).label).toBe('Strong')
      expect(getThreshold(75).label).toBe('Strong')
    })

    it('returns "Complete" for 76-100%', () => {
      expect(getThreshold(76).label).toBe('Complete')
      expect(getThreshold(90).label).toBe('Complete')
      expect(getThreshold(100).label).toBe('Complete')
    })

    it('returns correct colors for each threshold', () => {
      expect(getThreshold(0).color).toBe('#9CA3AF')
      expect(getThreshold(30).color).toBe('#F59E0B')
      expect(getThreshold(60).color).toBe('#84CC16')
      expect(getThreshold(100).color).toBe('#22C55E')
    })
  })

  describe('rendering', () => {
    it('renders with correct percentage and label', () => {
      render(<SegmentedProgress value={50} />)

      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(screen.getByText('Good')).toBeInTheDocument()
      expect(screen.getByText('Profile Completeness')).toBeInTheDocument()
    })

    it('renders 4 segments', () => {
      const { container } = render(<SegmentedProgress value={50} />)

      // The segments are inside the flex container
      const segmentContainer = container.querySelector('.flex.gap-1')
      expect(segmentContainer?.children.length).toBe(4)
    })

    it('hides label when showLabel is false', () => {
      render(<SegmentedProgress value={50} showLabel={false} />)

      expect(screen.queryByText('Profile Completeness')).not.toBeInTheDocument()
      expect(screen.queryByText('Good')).not.toBeInTheDocument()
    })

    it('has correct aria attributes', () => {
      render(<SegmentedProgress value={75} />)

      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '75')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
      expect(progressbar).toHaveAttribute('aria-valuemax', '100')
    })
  })

  describe('tooltip', () => {
    it('shows tooltip with missing sections on hover', () => {
      const missingSections = [
        { name: 'Personal Information', missing: 3 },
        { name: 'Skills', missing: 2 },
      ]

      render(<SegmentedProgress value={50} missingSections={missingSections} />)

      const progressbar = screen.getByRole('progressbar')
      fireEvent.mouseEnter(progressbar)

      expect(screen.getByText('Sections needing attention:')).toBeInTheDocument()
      expect(screen.getByText('Personal Information (3 missing)')).toBeInTheDocument()
      expect(screen.getByText('Skills (2 missing)')).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', () => {
      const missingSections = [{ name: 'Personal Information', missing: 3 }]

      render(<SegmentedProgress value={50} missingSections={missingSections} />)

      const progressbar = screen.getByRole('progressbar')
      fireEvent.mouseEnter(progressbar)
      expect(screen.getByText('Sections needing attention:')).toBeInTheDocument()

      fireEvent.mouseLeave(progressbar)
      expect(screen.queryByText('Sections needing attention:')).not.toBeInTheDocument()
    })

    it('does not show tooltip when no missing sections', () => {
      render(<SegmentedProgress value={100} missingSections={[]} />)

      const progressbar = screen.getByRole('progressbar')
      fireEvent.mouseEnter(progressbar)

      expect(screen.queryByText('Sections needing attention:')).not.toBeInTheDocument()
    })

    it('filters out sections with 0 missing', () => {
      const missingSections = [
        { name: 'Personal Information', missing: 0 },
        { name: 'Skills', missing: 2 },
      ]

      render(<SegmentedProgress value={50} missingSections={missingSections} />)

      const progressbar = screen.getByRole('progressbar')
      fireEvent.mouseEnter(progressbar)

      expect(screen.queryByText('Personal Information (0 missing)')).not.toBeInTheDocument()
      expect(screen.getByText('Skills (2 missing)')).toBeInTheDocument()
    })
  })

  describe('THRESHOLDS constant', () => {
    it('has 4 thresholds', () => {
      expect(THRESHOLDS.length).toBe(4)
    })

    it('covers the full 0-100 range', () => {
      expect(THRESHOLDS[0].max).toBe(25)
      expect(THRESHOLDS[1].max).toBe(50)
      expect(THRESHOLDS[2].max).toBe(75)
      expect(THRESHOLDS[3].max).toBe(100)
    })
  })
})
