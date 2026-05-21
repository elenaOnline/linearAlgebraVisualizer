import type { ConceptMeta } from '../../types'
import { VectorsPlaceholder } from './VectorsPlaceholder'
import { VectorsThumbnail } from './VectorsThumbnail'

const meta: ConceptMeta = {
  id: 'vectors',
  title: 'Vectors',
  blurb: 'Directed quantities in Rⁿ — arrows from the origin with addition and scalar multiplication.',
  supports: ['2d', '3d'],
  Component: VectorsPlaceholder,
  Thumbnail: VectorsThumbnail,
}

export default meta
