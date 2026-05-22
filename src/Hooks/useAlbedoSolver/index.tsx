export const calculateAlbedo = (a : number, b : number, beta : number, D1 : number, D2 : number, Sg1 : number, Sg2 : number, isInf : boolean, baffle: boolean) => {
    console.log("Calculando albedo com os seguintes parâmetros:", a, b, beta, D1, D2, Sg1, Sg2, isInf, baffle);
    if(baffle){
        console.log("Calculando albedo com baffle");
        const L1 = Math.sqrt(D1/Sg1);
        const L2 = Math.sqrt(D2/Sg2);
        let U = (-D1/L1)*(-(beta + D2/L2)*Math.exp((a + b)/2)*Math.exp(-a/L2)*((D1/L1)*Math.sinh(a/L1) + (D2/L2)*Math.cosh(a/L1)) + (beta - D2/L2)*Math.exp(-(a + b)/2)*Math.exp(a/L2)*((D1/L1)*Math.sinh(a/L1) - (D2/L2)*Math.cosh(a/L1)));
        let V = (beta + (D2/L2))*Math.exp((a + b)/2)*Math.exp(-a/L2)*((D1/L1)*Math.cosh(a/L1) + (D2/L2)*Math.sinh(a/L1)) + (beta - (D2/L2))*Math.exp(-(a + b)/2)*Math.exp(a/L2)*((D1/L1)*Math.cosh(a/L1) + (D2/L2)*Math.sinh(a/L1));

        if(isInf){
            U = (D1/L1)*((D2/L2)*Math.cosh(a/L1) + (D1/L1)*Math.sinh(a/L1));
            V = (D2/L2)*Math.sinh(a/L1) + (D1/L1)*Math.cosh(a/L1);
        }
        return U/V;
    }
    else{
        const L = Math.sqrt(D1/Sg1);
        let U = (D1/L)*(beta*Math.cosh(b/L) + (D1/L)*Math.sinh(b/L));
        let V = beta*Math.sinh(b/L) + (D1/L)*Math.cosh(b/L);
        if(isInf){
            return D1/L;
        }
        console.log("albedo calculado:", U/V);
        return U/V;
    }
}