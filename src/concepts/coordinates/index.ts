import type { ConceptMeta } from '../../types'
import { Coordinates } from './Coordinates'
import { CoordinatesThumbnail } from './CoordinatesThumbnail'

const meta: ConceptMeta = {
  id: 'coordinates',
  title: 'Coordinates and Bases',
  blurb:
    'The same vector has different coordinates in different bases — a choice of basis is a choice of labeling.',
  supports: ['2d'],
  Component: Coordinates,
  Thumbnail: CoordinatesThumbnail,
}

export default meta
