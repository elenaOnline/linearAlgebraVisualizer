import type { ConceptMeta } from '../../types'
import { BasisPlaceholder } from './BasisPlaceholder'
import { BasisThumbnail } from './BasisThumbnail'

const meta: ConceptMeta = {
  id: 'basis',
  title: 'Basis',
  blurb: 'A linearly independent spanning set — the minimal complete description of a vector space.',
  supports: ['2d', '3d'],
  Component: BasisPlaceholder,
  Thumbnail: BasisThumbnail,
}

export default meta
