/** Reduced row echelon form and related linear-algebra utilities.
 *  All computations use EPS as the single zero-test threshold.
 *  No React, no Three.js — pure math only.
 */

export const EPS = 1e-9

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Deep-copy a 2D number array */
function copyMatrix(M: number[][]): number[][] {
  return M.map((row) => [...row])
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Reduced row echelon form via Gauss–Jordan elimination with partial pivoting.
 * Returns a new matrix; does not mutate the input.
 */
export function rref(A: number[][], eps = EPS): number[][] {
  const M = copyMatrix(A)
  const rows = M.length
  if (rows === 0) return M
  const cols = M[0].length

  let pivotRow = 0

  for (let col = 0; col < cols && pivotRow < rows; col++) {
    // Find pivot: row with largest absolute value in this column (partial pivot)
    let maxVal = Math.abs(M[pivotRow][col])
    let maxRow = pivotRow
    for (let r = pivotRow + 1; r < rows; r++) {
      const v = Math.abs(M[r][col])
      if (v > maxVal) {
        maxVal = v
        maxRow = r
      }
    }

    if (maxVal < eps) continue // column is effectively zero — no pivot here

    // Swap pivot row into place
    if (maxRow !== pivotRow) {
      const tmp = M[pivotRow]
      M[pivotRow] = M[maxRow]
      M[maxRow] = tmp
    }

    // Scale pivot row so leading entry = 1
    const scale = M[pivotRow][col]
    for (let c = 0; c < cols; c++) {
      M[pivotRow][c] /= scale
    }

    // Eliminate all other rows
    for (let r = 0; r < rows; r++) {
      if (r === pivotRow) continue
      const factor = M[r][col]
      if (Math.abs(factor) < eps) continue
      for (let c = 0; c < cols; c++) {
        M[r][c] -= factor * M[pivotRow][c]
      }
    }

    pivotRow++
  }

  return M
}

/**
 * Rank of a matrix: number of non-zero rows in its RREF.
 */
export function rank(A: number[][], eps = EPS): number {
  const R = rref(A, eps)
  let r = 0
  for (const row of R) {
    if (row.some((v) => Math.abs(v) > eps)) r++
  }
  return r
}

/**
 * Basis for the nullspace of A (solutions to Ax = 0).
 * Returns an array of column vectors (each is a number[]).
 */
export function nullspaceBasis(A: number[][], eps = EPS): number[][] {
  const rows = A.length
  if (rows === 0) return []
  const cols = A[0].length
  if (cols === 0) return []

  const R = rref(A, eps)

  // Identify pivot columns
  const pivotCols: number[] = []
  let pivotRow = 0
  for (let col = 0; col < cols && pivotRow < rows; col++) {
    if (Math.abs(R[pivotRow][col]) > eps) {
      pivotCols.push(col)
      pivotRow++
    }
  }

  const pivotSet = new Set(pivotCols)
  const freeCols: number[] = []
  for (let c = 0; c < cols; c++) {
    if (!pivotSet.has(c)) freeCols.push(c)
  }

  // Each free column produces one nullspace basis vector
  const basis: number[][] = []
  for (const freeCol of freeCols) {
    const vec = new Array<number>(cols).fill(0)
    vec[freeCol] = 1
    // Back-substitute: for each pivot row p, find what the pivot variable must be
    for (let p = 0; p < pivotCols.length; p++) {
      const pc = pivotCols[p]
      // The p-th pivot row in R: R[p][pc] = 1, so pivot var = -R[p][freeCol]
      vec[pc] = -R[p][freeCol]
    }
    basis.push(vec)
  }

  return basis
}

/**
 * Dimension of the span of a set of vectors (all must have same length).
 * Treats each vector as a row, then computes rank.
 */
export function spanDimension(vecs: number[][], eps = EPS): number {
  if (vecs.length === 0) return 0
  return rank(vecs, eps)
}

/**
 * True if the given vectors are linearly independent (no vector is a linear
 * combination of the others).
 */
export function isLinearlyIndependent(vecs: number[][], eps = EPS): boolean {
  if (vecs.length === 0) return true
  return rank(vecs, eps) === vecs.length
}

/**
 * True if vector v lies in the span of the given vectors.
 * Uses RREF on the augmented matrix [vecs | v].
 */
export function isInSpan(v: number[], vecs: number[][], eps = EPS): boolean {
  if (vecs.length === 0) {
    // span of empty set is {0}; v is in it iff v = 0
    return v.every((c) => Math.abs(c) < eps)
  }

  const n = v.length
  const rankBefore = rank(vecs, eps)

  // Build augmented matrix with v appended as a new row
  const augmented = [...vecs, v]
  const rankAfter = rank(augmented, eps)

  // v is in the span iff adding it does not increase the rank
  return rankAfter === rankBefore && n > 0
}

/**
 * Express point p in the given basis.
 * Assumes basis is square (n vectors of length n) and invertible.
 * Returns the coordinate vector of p w.r.t. the basis.
 */
export function changeOfBasis(p: number[], basis: number[][], eps = EPS): number[] {
  const n = p.length
  if (basis.length !== n || basis.some((b) => b.length !== n)) {
    throw new Error('changeOfBasis: basis must be square and match p dimension')
  }

  // Solve basis * coords = p via Gauss–Jordan on [basis^T | p]
  // basis^T has the basis vectors as columns; row i is [basis[0][i], basis[1][i], ..., basis[n-1][i]]
  const aug: number[][] = []
  for (let i = 0; i < n; i++) {
    const row: number[] = []
    for (let j = 0; j < n; j++) {
      row.push(basis[j][i])
    }
    row.push(p[i])
    aug.push(row)
  }

  const R = rref(aug, eps)

  const coords: number[] = []
  for (let i = 0; i < n; i++) {
    coords.push(R[i][n])
  }
  return coords
}
