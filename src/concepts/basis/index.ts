import type { ConceptMeta } from '../../types'
import { Basis } from './Basis'
import { BasisThumbnail } from './BasisThumbnail'

const meta: ConceptMeta = {
  id: 'basis',
  title: 'Basis',
  blurb: 'A linearly independent spanning set — coordinates made unique.',
  supports: ['2d', '3d'],
  Component: Basis,
  Thumbnail: BasisThumbnail,
}

export default meta
