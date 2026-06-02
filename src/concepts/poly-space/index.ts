import type { ConceptMeta } from '../../types'
import { PolySpace } from './PolySpace'
import { PolySpaceThumbnail } from './PolySpaceThumbnail'

const meta: ConceptMeta = {
  id: 'poly-space',
  title: 'Polynomial Space',
  blurb:
    'A polynomial of degree ≤ 2 is a vector — move through coefficient space and watch the function update.',
  supports: [],
  Component: PolySpace,
  Thumbnail: PolySpaceThumbnail,
}

export default meta
