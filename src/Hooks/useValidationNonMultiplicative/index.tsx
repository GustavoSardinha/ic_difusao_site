import { useState } from 'react';

interface RunAllParams {
  numRegioes: string;
  zonasMateriais: string;
  mapeamento: string;
  numCelulasPorRegiao: string;
  fonteNeutrons: string;
  coeficientesDifusao: string;
  choquesMacroscopicos: string;
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
  fonteNeutrons: number[];
  coeficientesDifusao: number[];
  choquesMacroscopicos: number[];
  espessura: number[];
  comprimento: number;
  stepGraphic: number | string;
  stepTable: number | string;
}

export function useValidation() {
  const [validated, setValidated] = useState<boolean | null>(false);

  function sum(data: number[]): number {
    return data.reduce((acc, val) => acc + val, 0);
  }

  function validateIntForm(field: string, fieldName: string, expectedLength: number, unit: string): number[] {
    if (!field) throw new Error(`O valor fornecido para *${fieldName}* está vazio.`);
    const parts = field.split(";");
    if (parts.length !== expectedLength)
      throw new Error(`O valor fornecido para *${fieldName}* deve ter ${expectedLength} valores (${unit}).`);
    const nums = parts.map((v) => parseInt(v, 10));
    nums.forEach((n) => {
      if (isNaN(n) || n < 0) throw new Error(`*${fieldName}* inválido ou negativo.`);
    });
    return nums;
  }

  function validateFloatForm(field: string, fieldName: string, expectedLength: number, unit: string): number[] {
    if (!field) throw new Error(`O valor fornecido para *${fieldName}* está vazio.`);
    const nums = field.split(";").map(Number);
    if (nums.length !== expectedLength || nums.some(isNaN))
      throw new Error(`*${fieldName}* em formato inválido ou quantidade errada.`);
    if (nums.some((n) => n < 0)) throw new Error(`*${fieldName}* não pode ser negativo.`);
    if (nums.some((n) => n > 99999)) throw new Error(`*${fieldName}* muito grande.`);
    if (nums.some((n) => n !== 0 && n < 0.0001))
      throw new Error(`*${fieldName}* muito pequeno.`);
    return nums;
  }

  function validateNoZeros(arr: number[], fieldName: string): void {
    if (arr.some((n) => n === 0))
      throw new Error(`O valor fornecido para *${fieldName}* não pode ser zero.`);
  }

  function validateSteps(value: number | string | undefined, fieldName: string, limit: number, limitName: string): void {
    if (value === "" || value == null)
      throw new Error(`O campo *${fieldName}* não pode estar em branco.`);
    const numericValue = Number(value);
    if (isNaN(numericValue)) throw new Error(`*${fieldName}* deve ser um número.`);
    if (numericValue < 1) throw new Error(`*${fieldName}* deve ser no mínimo 1.`);
    if (numericValue > limit)
      throw new Error(`O *${fieldName}* não pode ultrapassar ${limitName} (${limit}).`);
  }

  function runAll(params: RunAllParams): RunAllResult {
    setValidated(null);

    const {
      numRegioes,
      zonasMateriais,
      mapeamento,
      numCelulasPorRegiao,
      fonteNeutrons,
      coeficientesDifusao,
      choquesMacroscopicos,
      espessura,
      stepGraphic,
      stepTable,
      advancedOptions,
      filterPoint,
    } = params;

    const r = parseInt(numRegioes, 10);
    if (isNaN(r) || r <= 0)
      throw new Error("*Número de Regiões* inválido (deve ser inteiro > 0).");

    const z = parseInt(zonasMateriais, 10);
    if (isNaN(z) || z <= 0)
      throw new Error("*Número de Zonas Materiais* inválido (deve ser inteiro > 0).");
    if (z > r) throw new Error("*Zonas Materiais* não pode ser maior que Regiões.");

    const mapArr = validateIntForm(mapeamento, "Mapeamento", r, "regiões");
    if (mapArr.some((idx) => idx > z))
      throw new Error("Índice do *Mapeamento* deve ser ≤ Número de Zonas.");
    validateNoZeros(mapArr, "Mapeamento");

    const cellsArr = validateIntForm(numCelulasPorRegiao, "Número de Células por Região", r, "regiões");
    validateNoZeros(cellsArr, "Número de Células por Região");

    const fonteArr = validateFloatForm(fonteNeutrons, "Fonte de Nêutrons", r, "regiões");
    const diffArr = validateFloatForm(coeficientesDifusao, "Coeficientes de Difusão", z, "zonas");
    validateNoZeros(diffArr, "Coeficientes de Difusão");

    const chocArr = validateFloatForm(choquesMacroscopicos, "Seções de Choque Macroscópicas", z, "zonas");
    validateNoZeros(chocArr, "Seções de Choque Macroscópicas");

    const espArr = validateFloatForm(espessura, "Espessura de cada Região", r, "regiões");
    validateNoZeros(espArr, "Espessura de cada Região");

    const totalLength = sum(espArr);

    validateSteps(stepGraphic, "Passo no Gráfico", sum(cellsArr), "Número de Células");
    validateSteps(stepTable, "Passo na Tabela", sum(cellsArr), "Número de Células");

    if (advancedOptions) {
      validateSteps(filterPoint, "Índice na malha de discretização", sum(cellsArr), "Número de Células");
    }

    const result: RunAllResult = {
      numRegioes: r,
      zonasMateriais: z,
      mapeamento: mapArr,
      numCelulasPorRegiao: cellsArr,
      fonteNeutrons: fonteArr,
      coeficientesDifusao: diffArr,
      choquesMacroscopicos: chocArr,
      espessura: espArr,
      comprimento: totalLength,
      stepGraphic,
      stepTable,
    };

    setValidated(true);
    return result;
  }

  return { validated, setValidated, runAll };
}
