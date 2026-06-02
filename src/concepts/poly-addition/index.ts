import type { ConceptMeta } from '../../types'
import { PolyAddition } from './PolyAddition'
import { PolyAdditionThumbnail } from './PolyAdditionThumbnail'

const meta: ConceptMeta = {
  id: 'poly-addition',
  title: 'Polynomial Addition',
  blurb:
    'Add two polynomials coefficient-wise — vector addition in P₂ brought to life.',
  supports: [],
  Component: PolyAddition,
  Thumbnail: PolyAdditionThumbnail,
}

export default meta
