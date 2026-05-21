import type { ConceptMeta } from '../../types'
import { Span } from './Span'
import { SpanThumbnail } from './SpanThumbnail'

const meta: ConceptMeta = {
  id: 'span',
  title: 'Span',
  blurb: 'The set of all linear combinations of a set of vectors — the subspace they generate.',
  supports: ['2d', '3d'],
  Component: Span,
  Thumbnail: SpanThumbnail,
}

export default meta
