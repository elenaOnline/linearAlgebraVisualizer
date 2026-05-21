import type { ConceptMeta } from '../../types'
import { LinearMaps } from './LinearMaps'
import { LinearMapsThumbnail } from './LinearMapsThumbnail'

const meta: ConceptMeta = {
  id: 'linear-maps',
  title: 'Matrices as Linear Maps',
  blurb: 'How a matrix transforms space — grid deformation, determinant as area factor.',
  supports: ['2d', '3d'],
  Component: LinearMaps,
  Thumbnail: LinearMapsThumbnail,
}

export default meta
