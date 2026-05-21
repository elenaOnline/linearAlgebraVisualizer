import type { ConceptMeta } from '../../types'
import { Nullspace } from './Nullspace'
import { NullspaceThumbnail } from './NullspaceThumbnail'

const meta: ConceptMeta = {
  id: 'nullspace',
  title: 'Nullspace',
  blurb: 'All vectors sent to zero — rank + nullity = n.',
  supports: ['2d', '3d'],
  Component: Nullspace,
  Thumbnail: NullspaceThumbnail,
}

export default meta
