export const calculateAlbedo = (a : number, b : number, beta : number) => {
    const D1 = 1;
    const D2 = 1;
    const L1 = Math.sqrt(D1/1);
    const L2 = Math.sqrt(D2/1);
    const U = (D1/L1)*(-(beta + D2/L2)*Math.exp((a + b)/2)*Math.exp(-a/L2)*((D1/L1)*Math.sinh(a/L1) + (D2/L2)*Math.cosh(a/L1)) + (beta - (D2/L2)*Math.exp(-(a + b)/2)*Math.exp(a/L2)*((D1/L1)*Math.sinh(a/L1) - (D2/L2)*Math.cosh(a/L1))));
    const V = (beta + (D2/L2))*Math.exp((a + b)/2)*Math.exp(-a/L2)*((D1/L1)*Math.cosh(a/L1) + (D2/L2)*Math.sinh(a/L1)) + (beta - (D2/L2))*Math.exp(-(a + b)/2)*Math.exp(a/L2)*((D1/L1)*Math.cosh(a/L1) + (D2/L2)*Math.sinh(a/L1));
    return U/V;
}