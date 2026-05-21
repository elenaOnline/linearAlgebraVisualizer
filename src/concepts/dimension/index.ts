import type { ConceptMeta } from '../../types'
import { DimensionPlaceholder } from './DimensionPlaceholder'
import { DimensionThumbnail } from './DimensionThumbnail'

const meta: ConceptMeta = {
  id: 'dimension',
  title: 'Dimension',
  blurb: 'The number of vectors in any basis — a well-defined invariant that measures the "degrees of freedom."',
  supports: ['2d', '3d'],
  Component: DimensionPlaceholder,
  Thumbnail: DimensionThumbnail,
}

export default meta
