import type { ConceptMeta } from '../../types'
import { NullspacePlaceholder } from './NullspacePlaceholder'
import { NullspaceThumbnail } from './NullspaceThumbnail'

const meta: ConceptMeta = {
  id: 'nullspace',
  title: 'Nullspace',
  blurb: 'The set of all vectors mapped to zero — a subspace that measures how much a matrix "collapses" the domain.',
  supports: ['2d', '3d'],
  Component: NullspacePlaceholder,
  Thumbnail: NullspaceThumbnail,
}

export default meta
