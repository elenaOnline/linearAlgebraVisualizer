import type { ConceptMeta } from '../types'
import vectors from './vectors/index'
import vectorSpaces from './vector-spaces/index'
import span from './span/index'
import basis from './basis/index'
import dimension from './dimension/index'
import linearMaps from './linear-maps/index'
import nullspace from './nullspace/index'

export const concepts: ConceptMeta[] = [
  vectors,
  vectorSpaces,
  span,
  basis,
  dimension,
  linearMaps,
  nullspace,
]
