export const calculateAlbedo = (a : number, b : number, beta : number, D1 : number, D2 : number, Sg1 : number, Sg2 : number, isInf : boolean, baffle: boolean) => {
    
    let alpha = oneRegionAlbedo(b, D1, Sg1, beta, isInf);
    
    if(baffle){
        alpha = oneRegionAlbedo(a, D2, Sg2, alpha, isInf);
    }
    return alpha;
}

const oneRegionAlbedo = (b: number, D : number, Sg: number, beta: number, isInf: boolean) => {
    const L = Math.sqrt(D/Sg);
    let U = (D/L)*(beta*Math.cosh(b/L) + (D/L)*Math.sinh(b/L));
    let V = beta*Math.sinh(b/L) + (D/L)*Math.cosh(b/L);
    if(isInf){
        return D/L;
    }
    return U/V;
} 