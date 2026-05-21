export * from './vector'
export {
  lerp as matLerp,
  matVec,
  matMat,
  det2,
  det3,
  transpose,
  identity,
} from './matrix'
export {
  EPS as SUBSPACE_EPS,
  rref,
  rank,
  nullspaceBasis,
  spanDimension,
  isLinearlyIndependent,
  isInSpan,
  changeOfBasis,
} from './subspace'
