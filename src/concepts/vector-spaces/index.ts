import type { ConceptMeta } from '../../types'
import { VectorSpaces } from './VectorSpaces'
import { VectorSpacesThumbnail } from './VectorSpacesThumbnail'

const meta: ConceptMeta = {
  id: 'vector-spaces',
  title: 'Vector Spaces',
  blurb: 'Subsets of Rⁿ closed under addition and scalar multiplication — the subspace conditions.',
  supports: ['2d', '3d'],
  Component: VectorSpaces,
  Thumbnail: VectorSpacesThumbnail,
}

export default meta
