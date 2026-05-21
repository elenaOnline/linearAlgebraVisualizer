import type { ConceptMeta } from '../../types'
import { LinearMapsPlaceholder } from './LinearMapsPlaceholder'
import { LinearMapsThumbnail } from './LinearMapsThumbnail'

const meta: ConceptMeta = {
  id: 'linear-maps',
  title: 'Matrices as Linear Maps',
  blurb: 'Square matrices as transformations of space — how they stretch, rotate, and reflect Rⁿ.',
  supports: ['2d', '3d'],
  Component: LinearMapsPlaceholder,
  Thumbnail: LinearMapsThumbnail,
}

export default meta
