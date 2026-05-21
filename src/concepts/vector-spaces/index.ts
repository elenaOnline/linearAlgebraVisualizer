import type { ConceptMeta } from '../../types'
import { VectorSpacesPlaceholder } from './VectorSpacesPlaceholder'
import { VectorSpacesThumbnail } from './VectorSpacesThumbnail'

const meta: ConceptMeta = {
  id: 'vector-spaces',
  title: 'Vector Spaces',
  blurb: 'Sets closed under addition and scalar multiplication — the abstract structure underlying linear algebra.',
  supports: ['2d', '3d'],
  Component: VectorSpacesPlaceholder,
  Thumbnail: VectorSpacesThumbnail,
}

export default meta
