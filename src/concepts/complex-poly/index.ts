import type { ConceptMeta } from '../../types'
import { ComplexPoly } from './ComplexPoly'
import { ComplexPolyThumbnail } from './ComplexPolyThumbnail'

const meta: ConceptMeta = {
  id: 'complex-poly',
  title: 'Complex Polynomial',
  blurb:
    'When polynomial coefficients are complex, domain coloring reveals the full structure — including the roots.',
  supports: [],
  Component: ComplexPoly,
  Thumbnail: ComplexPolyThumbnail,
}

export default meta
