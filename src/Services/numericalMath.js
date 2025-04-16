export function thomasSimetrico(diag, off, rhs) {
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