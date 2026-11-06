import { ResultStateNonMultiplicative } from "../Interfaces/ResultStateNonMultiplicative";
import { solveSymmetricTridiagonal } from "./numericalMath";

export interface NonMultiplicativeVectors {
  diagonal: number[];
  offDiagonal: number[];
  rightHandSide: number[];
}

export interface FluxProfile {
  solutions: number[];
  positions: number[];
}

export function generateNonMultiplicativeVectors(
  calculationResult: ResultStateNonMultiplicative
): NonMultiplicativeVectors {
  const diagonal: number[] = [];
  const offDiagonal: number[] = [];
  const rightHandSide: number[] = [];
  const {
    regionCount,
    mapping,
    cellsPerRegion,
    sourceNeutrons,
    diffusionCoefficients,
    crossSectionsMacroscopic,
    thickness,
    noGamma
  } = calculationResult;

  const cellCouplings: number[] = [];
  const cellSources: number[] = [];
  let cellCount = 0;
  const leftCondition = calculationResult.boundaryLeft.split(";").map(Number);
  const rightCondition = calculationResult.boundaryRight.split(";").map(Number);

  for (let regionIndex = 0; regionIndex < regionCount; regionIndex++) {
    const materialIndex = mapping[regionIndex] - 1;
    const diffusionCoefficient = diffusionCoefficients[materialIndex];
    const macroscopicCrossSection = crossSectionsMacroscopic[materialIndex];
    const neutronSource = sourceNeutrons[regionIndex];
    const cellWidth = thickness[regionIndex] / cellsPerRegion[regionIndex];
    const diffusionLength = Math.sqrt(diffusionCoefficient / macroscopicCrossSection);
    const scaledCellWidth = cellWidth / (2 * diffusionLength);
    const gamma = noGamma ? 1 : Math.tanh(scaledCellWidth) / scaledCellWidth;

    for (let cellIndex = 0; cellIndex < cellsPerRegion[regionIndex]; cellIndex++) {
      cellCount++;
      offDiagonal.push(
        diffusionCoefficient / (gamma * cellWidth) -
          macroscopicCrossSection * cellWidth * gamma / 4
      );
      cellCouplings.push(macroscopicCrossSection * cellWidth * gamma / 4);
      cellSources.push(neutronSource * cellWidth * gamma / 2);
    }
  }

  diagonal.push(offDiagonal[0] + 2 * cellCouplings[0] + Number(leftCondition[1]));
  rightHandSide.push(
    cellSources[0] + Number(calculationResult.incidenceLeft) * Number(leftCondition[0])
  );

  for (let index = 1; index < cellCount; index++) {
    diagonal.push(
      offDiagonal[index] + offDiagonal[index - 1] +
        2 * cellCouplings[index] + 2 * cellCouplings[index - 1]
    );
    rightHandSide.push(cellSources[index] + cellSources[index - 1]);
  }

  diagonal.push(
    offDiagonal[cellCount - 1] + 2 * cellCouplings[cellCount - 1] + Number(rightCondition[1])
  );
  rightHandSide.push(
    cellSources[cellCount - 1] +
      Number(calculationResult.incidenceRight) * Number(rightCondition[0])
  );

  return { diagonal, offDiagonal, rightHandSide };
}

export function getNonMultiplicativeFluxProfile(
  calculationResult: ResultStateNonMultiplicative
): FluxProfile {
  const { diagonal, offDiagonal, rightHandSide } =
    generateNonMultiplicativeVectors(calculationResult);
  const solutions = solveSymmetricTridiagonal(diagonal, offDiagonal, rightHandSide);
  const positions = [0];
  let position = 0;

  calculationResult.cellsPerRegion.forEach((cellsInRegion, regionIndex) => {
    const cellWidth = calculationResult.thickness[regionIndex] / cellsInRegion;
    for (let cellIndex = 0; cellIndex < cellsInRegion; cellIndex++) {
      position += cellWidth;
      positions.push(position);
    }
  });

  return { solutions, positions };
}
