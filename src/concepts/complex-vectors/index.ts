import type { ConceptMeta } from '../../types'
import { ComplexVectors } from './ComplexVectors'
import { ComplexVectorsThumbnail } from './ComplexVectorsThumbnail'

const meta: ConceptMeta = {
  id: 'complex-vectors',
  title: 'Vectors in ℂ²',
  blurb:
    'A vector in ℂ² has four real coordinates — shown honestly as two complex planes and a color-encoded point.',
  supports: [],
  Component: ComplexVectors,
  Thumbnail: ComplexVectorsThumbnail,
}

export default meta
