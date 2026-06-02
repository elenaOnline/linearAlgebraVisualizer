import type { ConceptMeta } from '../types'
import vectors from './vectors/index'
import vectorSpaces from './vector-spaces/index'
import span from './span/index'
import basis from './basis/index'
import dimension from './dimension/index'
import linearMaps from './linear-maps/index'
import nullspace from './nullspace/index'
import polySpace from './poly-space/index'
import polyAddition from './poly-addition/index'
import polyScalarMul from './poly-scalar-mul/index'
import complexPoly from './complex-poly/index'
import differentiation from './differentiation/index'
import coordinates from './coordinates/index'
import isomorphism from './isomorphism/index'
import complexPlane from './complex-plane/index'
import complexVectors from './complex-vectors/index'
import complexAddition from './complex-addition/index'
import complexScalarMul from './complex-scalar-mul/index'

export const concepts: ConceptMeta[] = [
  vectors,
  vectorSpaces,
  span,
  basis,
  dimension,
  linearMaps,
  nullspace,
  polySpace,
  polyAddition,
  polyScalarMul,
  complexPoly,
  differentiation,
  coordinates,
  isomorphism,
  complexPlane,
  complexVectors,
  complexAddition,
  complexScalarMul,
]
