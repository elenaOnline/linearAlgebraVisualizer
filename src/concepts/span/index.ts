import type { ConceptMeta } from '../../types'
import { SpanPlaceholder } from './SpanPlaceholder'
import { SpanThumbnail } from './SpanThumbnail'

const meta: ConceptMeta = {
  id: 'span',
  title: 'Span',
  blurb: 'The set of all linear combinations of a collection of vectors — the smallest subspace containing them.',
  supports: ['2d', '3d'],
  Component: SpanPlaceholder,
  Thumbnail: SpanThumbnail,
}

export default meta
