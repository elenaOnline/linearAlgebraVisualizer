import type { ConceptMeta } from '../../types'
import { Vectors } from './Vectors'
import { VectorsThumbnail } from './VectorsThumbnail'

const meta: ConceptMeta = {
  id: 'vectors',
  title: 'Vectors',
  blurb: 'Directed quantities in Rⁿ — arrows from the origin with addition and scalar multiplication.',
  supports: ['2d', '3d'],
  Component: Vectors,
  Thumbnail: VectorsThumbnail,
}

export default meta
