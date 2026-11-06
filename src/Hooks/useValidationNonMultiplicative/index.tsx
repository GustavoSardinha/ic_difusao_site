import { useState } from "react";

interface RunAllParams {
  regionCount: string;
  materialZoneCount: string;
  mapping: string;
  cellsPerRegion: string;
  sourceNeutrons: string;
  diffusionCoefficients: string;
  crossSectionsMacroscopic: string;
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
  sourceNeutrons: number[];
  diffusionCoefficients: number[];
  crossSectionsMacroscopic: number[];
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
      throw new Error(`O campo *${fieldName}* não pode conter zeros.`);
  }

  function validateSteps(
    value: number | string | undefined,
    fieldName: string,
    limit: number,
    limitName: string
  ): void {
    if (value === "" || value == null)
      throw new Error(`O campo *${fieldName}* não pode estar vazio.`);
    const numericValue = Number(value);
    if (isNaN(numericValue))
      throw new Error(`O campo *${fieldName}* deve ser um número.`);
    if (numericValue < 1)
      throw new Error(`O campo *${fieldName}* deve ser no mínimo 1.`);
    if (numericValue > limit)
      throw new Error(
        `O campo *${fieldName}* não pode ultrapassar o ${limitName} (${limit}).`
      );
  }

  function runAll(params: RunAllParams): RunAllResult {
    setValidated(null);

    const {
      regionCount,
      materialZoneCount,
      mapping,
      cellsPerRegion,
      sourceNeutrons,
      diffusionCoefficients,
      crossSectionsMacroscopic,
      thickness,
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
    if (z > r)
      throw new Error(
        `O *Número de Zonas Materiais* não pode ser maior que o *Número de Regiões*.`
      );

    const mappingArray = validateIntForm(mapping, "Mapeamento", r, "regiões");
    if (mappingArray.some((idx) => idx > z))
      throw new Error(
        `Os índices do campo *Mapeamento* não podem ser maiores que o número de Zonas.`
      );
    validateNoZeros(mappingArray, "Mapeamento");

    const cellCounts = validateIntForm(
      cellsPerRegion,
      "Número de Células por Região",
      r,
      "regiões"
    );
    validateNoZeros(cellCounts, "Número de Células por Região");

    const sourceArr = validateFloatForm(
      sourceNeutrons,
      "Fonte de Nêutrons",
      r,
      "regiões"
    );
    const diffusionCoefficientArray = validateFloatForm(
      diffusionCoefficients,
      "Coeficientes de Difusão",
      z,
      "zonas"
    );
    validateNoZeros(diffusionCoefficientArray, "Coeficientes de Difusão");

    const crossSectionArray = validateFloatForm(
      crossSectionsMacroscopic,
      "Seções de Choque Macroscópicas",
      z,
      "zonas"
    );
    validateNoZeros(crossSectionArray, "Seções de Choque Macroscópicas");

    const thicknessArray = validateFloatForm(
      thickness,
      "Espessura de cada Região",
      r,
      "regiões"
    );
    validateNoZeros(thicknessArray, "Espessura de cada Região");

    const totalLength = sum(thicknessArray);

    validateSteps(
      stepGraphic,
      "Passo no Gráfico",
      sum(cellCounts),
      "Número de Células"
    );
    validateSteps(
      stepTable,
      "Passo na Tabela",
      sum(cellCounts),
      "Número de Células"
    );

    if (advancedOptions) {
      validateSteps(
        filterPoint,
        "Índice na malha de discretização",
        sum(cellCounts) + 1,
        "Número de Células + 1"
      );
    }

    const result: RunAllResult = {
      regionCount: r,
      materialZoneCount: z,
      mapping: mappingArray,
      cellsPerRegion: cellCounts,
      sourceNeutrons: sourceArr,
      diffusionCoefficients: diffusionCoefficientArray,
      crossSectionsMacroscopic: crossSectionArray,
      thickness: thicknessArray,
      length: totalLength,
      stepGraphic,
      stepTable,
    };

    setValidated(true);
    return result;
  }

  return { validated, setValidated, runAll };
}
