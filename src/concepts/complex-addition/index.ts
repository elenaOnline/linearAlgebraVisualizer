import type { ConceptMeta } from '../../types'
import { ComplexAddition } from './ComplexAddition'
import { ComplexAdditionThumbnail } from './ComplexAdditionThumbnail'

const meta: ConceptMeta = {
  id: 'complex-addition',
  title: 'Addition in ℂ²',
  blurb:
    'Adding two vectors in ℂ² adds each component independently — shown as two simultaneous tip-to-tail constructions.',
  supports: [],
  Component: ComplexAddition,
  Thumbnail: ComplexAdditionThumbnail,
  disabled: true,
}

export default meta
