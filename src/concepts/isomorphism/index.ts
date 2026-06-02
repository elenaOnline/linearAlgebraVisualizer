import type { ConceptMeta } from '../../types'
import { Isomorphism } from './Isomorphism'
import { IsomorphismThumbnail } from './IsomorphismThumbnail'

const meta: ConceptMeta = {
  id: 'isomorphism',
  title: 'Isomorphic Spaces',
  blurb:
    'R² and the space of linear polynomials are structurally identical — the same abstract 2D space wearing different labels.',
  supports: [],
  Component: Isomorphism,
  Thumbnail: IsomorphismThumbnail,
}

export default meta
