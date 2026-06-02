import type { ConceptMeta } from '../../types'
import { Differentiation } from './Differentiation'
import { DifferentiationThumbnail } from './DifferentiationThumbnail'

const meta: ConceptMeta = {
  id: 'differentiation',
  title: 'Differentiation as a Linear Map',
  blurb:
    'The derivative maps P₂ to P₁ — a 3D space collapses onto a 2D space, with a visible kernel.',
  supports: [],
  Component: Differentiation,
  Thumbnail: DifferentiationThumbnail,
}

export default meta
