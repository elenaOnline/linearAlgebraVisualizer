import type { ConceptMeta } from '../../types'
import { PolyScalarMul } from './PolyScalarMul'
import { PolyScalarMulThumbnail } from './PolyScalarMulThumbnail'

const meta: ConceptMeta = {
  id: 'poly-scalar-mul',
  title: 'Polynomial Scalar Multiplication',
  blurb:
    'Scale a polynomial by a constant — scalar multiplication in P₂ stretches, compresses, and flips.',
  supports: [],
  Component: PolyScalarMul,
  Thumbnail: PolyScalarMulThumbnail,
}

export default meta
