import { useState } from 'react';

interface RunAllParams {
  regionCount: string;
  materialZoneCount: string;
  mapping: string;
  cellsPerRegion: string;
  diffusionCoefficients: string;
  crossSectionsMacroscopicAbs: string;
  crossSectionsMacroscopicFis: string;
  neutronsPerFission: string;
  noNi: boolean;
  power: string;
  energy: string;
  thickness: string;
  stepGraphic: number | string;
  stepTable: number | string;
  advancedOptions?: boolean;
  filterPoint?: number | string;
}

interface RunAllResult {
  regionCount: number;
  materialZoneCount: number;
  mapping: number[];
  cellsPerRegion: number[];
  diffusionCoefficients: number[];
  crossSectionsMacroscopicAbs: number[];
  crossSectionsMacroscopicFis: number[];
  neutronsPerFission: number;
  noNi: boolean;
  power: number;
  energy: number;
  thickness: number[];
  length: number;
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
      regionCount,
      materialZoneCount,
      mapping,
      cellsPerRegion,
      diffusionCoefficients,
      crossSectionsMacroscopicAbs,
      crossSectionsMacroscopicFis,
      neutronsPerFission,
      noNi,
      thickness,
      power,
      energy,
      stepGraphic,
      stepTable,
      advancedOptions,
      filterPoint,
    } = params;

    const r = parseInt(regionCount, 10);
    if (isNaN(r) || r <= 0)
      throw new Error(`O *Número de Regiões* não pode estar em branco.`);

    const z = parseInt(materialZoneCount, 10);
    if (isNaN(z) || z <= 0)
      throw new Error(`O *Número de Zonas Materiais* não pode estar em branco.`);
    if (z > r) throw new Error(`O *Número de Zonas Materiais* não pode ser maior que o *Número de Regiões*.`);

    const mappingArray = validateIntForm(mapping, "Mapeamento", r, "regiões");
    if (mappingArray.some((idx) => idx > z))
      throw new Error(`O valor de *Mapeamento* não pode se referir a uma zona inexistente (máximo: ${z}).`);
    validateNoZeros(mappingArray, "Mapeamento");

    const cellCounts = validateIntForm(cellsPerRegion, "Número de Células por Região", r, "regiões");
    validateNoZeros(cellCounts, "Número de Células por Região");

    const diffusionCoefficientArray = validateFloatForm(diffusionCoefficients, "Coeficientes de Difusão", z, "zonas");
    validateNoZeros(diffusionCoefficientArray, "Coeficientes de Difusão");

    const crossSectionArray = validateFloatForm(crossSectionsMacroscopicAbs, "Seções de Choque Macroscópicas de Absorção", z, "zonas");
    validateNoZeros(crossSectionArray, "Seções de Choque Macroscópicas de Absorção");

    const fissionCrossSectionArray = validateFloatForm(crossSectionsMacroscopicFis, "Seções de Choque Macroscópicas de Fissão", z, "zonas");

    const thicknessArray = validateFloatForm(thickness, "Espessura de cada Região", r, "regiões");
    validateNoZeros(thicknessArray, "Espessura de cada Região");

    const ni = parseInt(neutronsPerFission, 10);
    if (noNi) {
      if (isNaN(ni) || ni <= 0)
        throw new Error(`O valor de *Número de nêutrons gerados por fissão* deve ser inteiro e maior que 0.`);
    }

    let p = 200;
    if (power !== "") {
      p = parseInt(power, 10);
      if (isNaN(p) || p <= 0)
        throw new Error(`O valor de *Potência gerada pelo reator* deve ser inteiro e maior que 0.`);
    }
    else{
      p = 200;
    }

    let e = 200;
    if (energy !== "") {
      e = parseInt(energy, 10);
      if (isNaN(e) || e <= 0)
        throw new Error(`O valor de *Energia liberada por fissão* deve ser inteiro e maior que 0.`);
    } else{
      e = 200;
    }
    const totalLength = sum(thicknessArray);

    validateSteps(stepGraphic, "Passo no Gráfico", sum(cellCounts), "Número de Células");
    validateSteps(stepTable, "Passo na Tabela", sum(cellCounts), "Número de Células");

    if (advancedOptions) {
      validateSteps(filterPoint, "Índice na malha de discretização", sum(cellCounts) + 1, "Número de Células + 1");
    }

    const result: RunAllResult = {
      regionCount: r,
      materialZoneCount: z,
      mapping: mappingArray,
      cellsPerRegion: cellCounts,
      diffusionCoefficients: diffusionCoefficientArray,
      crossSectionsMacroscopicAbs: crossSectionArray,
      crossSectionsMacroscopicFis: fissionCrossSectionArray,
      neutronsPerFission: ni,
      noNi,
      thickness: thicknessArray,
      power: p,
      energy: e,
      length: totalLength,
      stepGraphic,
      stepTable,
    };

    setValidated(true);
    return result;
  }

  return { validated, setValidated, runAll };
}
