import type { ConceptMeta } from '../../types'
import { ComplexScalarMul } from './ComplexScalarMul'
import { ComplexScalarMulThumbnail } from './ComplexScalarMulThumbnail'

const meta: ConceptMeta = {
  id: 'complex-scalar-mul',
  title: 'Scalar Multiplication in ℂ²',
  blurb:
    'A complex scalar rotates and scales both components simultaneously — visible as spatial rotation and hue shift at once.',
  supports: [],
  Component: ComplexScalarMul,
  Thumbnail: ComplexScalarMulThumbnail,
}

export default meta
