import type { ConceptMeta } from '../../types'
import { ComplexPlane } from './ComplexPlane'
import { ComplexPlaneThumbnail } from './ComplexPlaneThumbnail'

const meta: ConceptMeta = {
  id: 'complex-plane',
  title: 'The Complex Plane',
  blurb:
    'Complex scalar multiplication rotates as well as scales — something real multiplication cannot do.',
  supports: [],
  Component: ComplexPlane,
  Thumbnail: ComplexPlaneThumbnail,
}

export default meta
