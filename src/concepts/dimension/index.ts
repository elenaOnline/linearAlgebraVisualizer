import type { ConceptMeta } from '../../types'
import { Dimension } from './Dimension'
import { DimensionThumbnail } from './DimensionThumbnail'

const meta: ConceptMeta = {
  id: 'dimension',
  title: 'Dimension',
  blurb: 'The number of truly independent directions — the rank of the spanning set.',
  supports: ['2d', '3d'],
  Component: Dimension,
  Thumbnail: DimensionThumbnail,
}

export default meta
