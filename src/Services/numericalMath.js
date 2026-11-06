export function solveSymmetricTridiagonal(diag, off, rhs) {
    const n = diag.length;
    const cp = new Array(n - 1);
    const dp = new Array(n);


    dp[0] = rhs[0] / diag[0];
    if (n > 1) {
      cp[0] = - off[0] / diag[0];
    }

    for (let i = 1; i < n; i++) {
      const denom = diag[i] + off[i - 1] * cp[i - 1];
      dp[i] = (rhs[i] + off[i - 1] * dp[i - 1]) / denom;
      if (i < n - 1) {
        cp[i] = - off[i] / denom;
      }
    }

    const x = new Array(n);
    x[n - 1] = dp[n - 1];
    for (let i = n - 2; i >= 0; i--) {
      x[i] = dp[i] - cp[i] * x[i + 1];
    }

    return x;
}

export function relativeDeviation(value, valuePrevious){
    return Math.abs(value - valuePrevious)/value;
}
export function numericalIntegral(solutions, thickness, start, end) {
  let result = 0;

  for (let i = start; i < end; i++) {
    result += 0.5 * (solutions[i] + solutions[i + 1]) * thickness;
  }

  return result;
}
export function integralDiffusionSimpson(solutions, h, start, end) {
  const n = end - start;

  // fallback seguro
  if (n < 2) return 0;
  if (n % 2 !== 0) {
    // último intervalo via trapézio
    let sum = solutions[start] + solutions[end - 1];
    for (let i = 1; i < n - 1; i++) {
      sum += (i % 2 === 0 ? 2 : 4) * solutions[start + i];
    }
    return (h / 3) * sum
         + 0.5 * (solutions[end - 1] + solutions[end]) * h;
  }

  let sum = solutions[start] + solutions[end];

  for (let i = 1; i < n; i++) {
    sum += (i % 2 === 0 ? 2 : 4) * solutions[start + i];
  }

  return (h / 3) * sum;
}