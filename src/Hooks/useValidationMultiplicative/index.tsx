import { useState } from 'react';

interface RunAllParams {
  numRegioes: string;
  zonasMateriais: string;
  mapeamento: string;
  numCelulasPorRegiao: string;
  coeficientesDifusao: string;
  choquesMacroscopicosAbs: string;
  choquesMacroscopicosFis: string;
  Ni: string;
  noNi: boolean;
  potencia: string;
  energia: string;
  espessura: string;
  stepGraphic: number | string;
  stepTable: number | string;
  advancedOptions?: boolean;
  filterPoint?: number | string;
}

interface RunAllResult {
  numRegioes: number;
  zonasMateriais: number;
  mapeamento: number[];
  numCelulasPorRegiao: number[];
  coeficientesDifusao: number[];
  choquesMacroscopicosAbs: number[];
  choquesMacroscopicosFis: number[];
  Ni: number;
  noNi: boolean;
  potencia: number;
  energia: number;
  espessura: number[];
  comprimento: number;
  stepGraphic: number | string;
  stepTable: number | string;
}

export function useValidation() {
  const [validated, setValidated] = useState<boolean | null>(false);

  const pluralize = (count: number, singular: string, plural: string) =>
    `${count} ${count === 1 ? singular : plural}`;

  function sum(data: number[]): number {
    return data.reduce((acc, val) => acc + val, 0);
  }

  // ======= VALIDATE INT (STRICT) =======
  function validateIntForm(field: string, fieldName: string, expectedLength: number, unit: string): number[] {
    if (!field) throw new Error(`O valor de *${fieldName}* está vazio.`);
    const parts = field.split(";");
    if (parts.length !== expectedLength)
      throw new Error(`O valor de *${fieldName}* deve conter exatamente ${pluralize(expectedLength, "valor", "valores")} (${unit}).`);

    const nums: number[] = parts.map((raw) => {
      const part = raw.trim();
      // aceita apenas dígitos (sem sinal, sem casas decimais)
      if (!/^\d+$/.test(part)) {
        throw new Error(`O valor de *${fieldName}* é inválido ou negativo.`);
      }
      const n = parseInt(part, 10);
      if (n < 0) {
        throw new Error(`O valor de *${fieldName}* é inválido ou negativo.`);
      }
      return n;
    });

    return nums;
  }
  // =====================================

  function validateFloatForm(field: string, fieldName: string, expectedLength: number, unit: string): number[] {
    if (!field) throw new Error(`O valor de *${fieldName}* está vazio.`);
    const nums = field.split(";").map(Number);
    if (nums.length !== expectedLength || nums.some(isNaN))
      throw new Error(`O valor de *${fieldName}* está em formato inválido ou com quantidade incorreta de valores (esperado: ${pluralize(expectedLength, "valor numérico", "valores numéricos")}).`);
    if (nums.some((n) => n < 0)) throw new Error(`O valor de *${fieldName}* não pode ser negativo.`);
    if (nums.some((n) => n > 99999)) throw new Error(`O valor de *${fieldName}* é muito grande.`);
    if (nums.some((n) => n !== 0 && n < 0.0001))
      throw new Error(`O valor de *${fieldName}* é muito pequeno (mínimo permitido: 0.0001, exceto zero).`);
    return nums;
  }

  function validateNoZeros(arr: number[], fieldName: string): void {
    if (arr.some((n) => n === 0))
      throw new Error(`O valor de *${fieldName}* não pode ser zero.`);
  }

  function validateSteps(value: number | string | undefined, fieldName: string, limit: number, limitName: string): void {
    if (value === "" || value == null)
      throw new Error(`O campo *${fieldName}* não pode estar em branco.`);
    const numericValue = Number(value);
    if (isNaN(numericValue)) throw new Error(`O valor de *${fieldName}* deve ser um número.`);
    if (numericValue < 1) throw new Error(`O valor de *${fieldName}* deve ser no mínimo 1.`);
    if (numericValue > limit)
      throw new Error(`O valor de *${fieldName}* não pode ultrapassar o número de *${limitName}* (${limit}).`);
  }

  function runAll(params: RunAllParams): RunAllResult {
    setValidated(null);

    const {
      numRegioes,
      zonasMateriais,
      mapeamento,
      numCelulasPorRegiao,
      coeficientesDifusao,
      choquesMacroscopicosAbs,
      choquesMacroscopicosFis,
      Ni,
      noNi,
      espessura,
      potencia,
      energia,
      stepGraphic,
      stepTable,
      advancedOptions,
      filterPoint,
    } = params;

    const r = parseInt(numRegioes, 10);
    if (isNaN(r) || r <= 0)
      throw new Error(`O *Número de Regiões* não pode estar em branco.`);

    const z = parseInt(zonasMateriais, 10);
    if (isNaN(z) || z <= 0)
      throw new Error(`O *Número de Zonas Materiais* não pode estar em branco.`);
    if (z > r) throw new Error(`O *Número de Zonas Materiais* não pode ser maior que o *Número de Regiões*.`);

    const mapArr = validateIntForm(mapeamento, "Mapeamento", r, "regiões");
    if (mapArr.some((idx) => idx > z))
      throw new Error(`O valor de *Mapeamento* não pode se referir a uma zona inexistente (máximo: ${z}).`);
    validateNoZeros(mapArr, "Mapeamento");

    const cellsArr = validateIntForm(numCelulasPorRegiao, "Número de Células por Região", r, "regiões");
    validateNoZeros(cellsArr, "Número de Células por Região");

    const diffArr = validateFloatForm(coeficientesDifusao, "Coeficientes de Difusão", z, "zonas");
    validateNoZeros(diffArr, "Coeficientes de Difusão");

    const chocArr = validateFloatForm(choquesMacroscopicosAbs, "Seções de Choque Macroscópicas de Absorção", z, "zonas");
    validateNoZeros(chocArr, "Seções de Choque Macroscópicas de Absorção");

    const chocArrFis = validateFloatForm(choquesMacroscopicosFis, "Seções de Choque Macroscópicas de Fissão", z, "zonas");
    validateNoZeros(chocArrFis, "Seções de Choque Macroscópicas de Fissão");

    const espArr = validateFloatForm(espessura, "Espessura de cada Região", r, "regiões");
    validateNoZeros(espArr, "Espessura de cada Região");

    const ni = parseInt(Ni, 10);
    if (noNi) {
      if (isNaN(ni) || ni <= 0)
        throw new Error(`O valor de *Número de nêutrons gerados por fissão* deve ser inteiro e maior que 0.`);
    }

    let p = 200;
    if (potencia !== "") {
      p = parseInt(potencia, 10);
      if (isNaN(p) || p <= 0)
        throw new Error(`O valor de *Potência gerada pelo reator* deve ser inteiro e maior que 0.`);
    }
    else{
      p = 200;
    }

    let e = 200;
    if (energia !== "") {
      e = parseInt(energia, 10);
      if (isNaN(e) || e <= 0)
        throw new Error(`O valor de *Energia liberada por fissão* deve ser inteiro e maior que 0.`);
    } else{
      e = 200;
    }
    const totalLength = sum(espArr);

    validateSteps(stepGraphic, "Passo no Gráfico", sum(cellsArr), "Número de Células");
    validateSteps(stepTable, "Passo na Tabela", sum(cellsArr), "Número de Células");

    if (advancedOptions) {
      validateSteps(filterPoint, "Índice na malha de discretização", sum(cellsArr) + 1, "Número de Células + 1");
    }

    const result: RunAllResult = {
      numRegioes: r,
      zonasMateriais: z,
      mapeamento: mapArr,
      numCelulasPorRegiao: cellsArr,
      coeficientesDifusao: diffArr,
      choquesMacroscopicosAbs: chocArr,
      choquesMacroscopicosFis: chocArrFis,
      Ni: ni,
      noNi,
      espessura: espArr,
      potencia: p,
      energia: e,
      comprimento: totalLength,
      stepGraphic,
      stepTable,
    };

    setValidated(true);
    return result;
  }

  return { validated, setValidated, runAll };
}
