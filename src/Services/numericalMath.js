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

export function desvioRelativo(value, valueAnt){
    return Math.abs(value - valueAnt)/value;
}
export function integralNumerica(solucoes, espessura, inicio, fim){
  let resultado = 0;
  for(let i = inicio; i < fim - 1; i++){
    resultado += 0.5 * (solucoes[i] + solucoes[i + 1]) * espessura;
  }
  return resultado;
}
export function integralDifusaoSimpson(solucoes, h, inicio, fim) {
  const n = fim - inicio;

  // fallback seguro
  if (n < 2) return 0;
  if (n % 2 !== 0) {
    // último intervalo via trapézio
    let soma = solucoes[inicio] + solucoes[fim - 1];
    for (let i = 1; i < n - 1; i++) {
      soma += (i % 2 === 0 ? 2 : 4) * solucoes[inicio + i];
    }
    return (h / 3) * soma
         + 0.5 * (solucoes[fim - 1] + solucoes[fim]) * h;
  }

  let soma = solucoes[inicio] + solucoes[fim];

  for (let i = 1; i < n; i++) {
    soma += (i % 2 === 0 ? 2 : 4) * solucoes[inicio + i];
  }

  return (h / 3) * soma;
}