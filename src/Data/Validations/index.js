import { useState } from 'react';

export function useValidation() {
  const [validated, setValidated] = useState(false);

  function sum(data){
    let sum = 0;
    data.forEach((val) => {
      sum += val;
    });
    return sum;
  }

  const validateIntForm = (field, fieldName, expectedLength, unit) => {
    if (!field) throw new Error(`O valor fornecido para *${fieldName}* está vazio.`);
    const parts = field.split(";");
    if (parts.length !== expectedLength)
      throw new Error(
        `O valor fornecido para *${fieldName}* deve ter ${expectedLength} valores (${unit}).`
      );
    const nums = parts.map((v) => parseInt(v, 10));
    nums.forEach((n) => {
      if (isNaN(n) || n < 0) throw new Error(`*${fieldName}* inválido ou negativo.`);
    });
    return nums;
  };

  const validateFloatForm = (field, fieldName, expectedLength, unit) => {
    if (!field) throw new Error(`O valor fornecido para *${fieldName}* está vazio.`);
    const nums = field.split(";").map(Number);
    if (nums.length !== expectedLength || nums.some(isNaN))
      throw new Error(`*${fieldName}* em formato inválido ou quantidade errada.`);
    if (nums.some((n) => n < 0)) throw new Error(`*${fieldName}* não pode ser negativo.`);
    if (nums.some((n) => n > 99999)) throw new Error(`*${fieldName}* muito grande.`);
    if (nums.some((n) => n !== 0 && n < 0.0001))
      throw new Error(`*${fieldName}* muito pequeno.`);
    return nums;
  };

  const validateNoZeros = (arr, fieldName) => {
    if (arr.some((n) => n === 0))
      throw new Error(`O valor fornecido para *${fieldName}* não pode ser zero.`);
  };

  const validateSteps = (value, fieldName, limit, limitName) => {
    if (value === "" || value == null)
      throw new Error(`O campo *${fieldName}* não pode estar em branco.`);
    if (value < 1) throw new Error(`*${fieldName}* deve ser no mínimo 1.`);
    if (value > limit)
      throw new Error(`O *${fieldName}* não pode ultrapassar ${limitName} (${limit}).`);
  };

  function runAll({
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
  }) {
    // limpa validated anterior
    setValidated(null);

    // começa a validação
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

    const cellsArr = validateIntForm(
      numCelulasPorRegiao,
      "Número de Células por Região",
      r,
      "regiões"
    );
    validateNoZeros(cellsArr, "Número de Células por Região");

    const fonteArr = validateFloatForm(fonteNeutrons, "Fonte de Nêutrons", r, "regiões");
    const diffArr = validateFloatForm(
      coeficientesDifusao,
      "Coeficientes de Difusão",
      z,
      "zonas"
    );
    validateNoZeros(diffArr, "Coeficientes de Difusão");

    const chocArr = validateFloatForm(
      choquesMacroscopicos,
      "Seções de Choque Macroscópicas",
      z,
      "zonas"
    );
    validateNoZeros(chocArr, "Seções de Choque Macroscópicas");

    const espArr = validateFloatForm(espessura, "Espessura de cada Região", r, "regiões");
    validateNoZeros(espArr, "Espessura de cada Região");

    const totalLength = sum(espArr);

    validateSteps(Number(stepGraphic), "Passo no Gráfico", sum(cellsArr), "Número de Células");
    validateSteps(Number(stepTable), "Passo na Tabela", sum(cellsArr), "Número de Células");

    const result = {
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

    setValidated(result);
    return result;
  }

  return { validated, setValidated, runAll };
}
