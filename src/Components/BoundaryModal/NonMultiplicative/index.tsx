import React, { useState } from "react";
import "../../../Styles/Modal/Modal.css";
import "../../../Styles/Modal/Contorno.css";
import "../../../Styles/FormInput/Input.css";
import FormInput from "../../FormInput";

interface BoundaryModalProps {
  boundaryLeft: string;
  setBoundaryLeft: (value: string) => void;
  incidenceLeft: number;
  setIncidenceLeft: (value: number) => void;

  boundaryRight: string;
  setBoundaryRight: (value: string) => void;
  incidenceRight: number;
  setIncidenceRight: (value: number) => void;

  L: number;

  successFunc: () => void;

}

function BoundaryModal(props: BoundaryModalProps) {
  const isZeroCase = (value: string) =>
    value === "0;0" || value === "0;99999999999999999999";
  const [disabledLeft, setDisabledLeft] = useState(
    () => isZeroCase(props.boundaryLeft)
  );
  const [disabledRight, setDisabledRight] = useState(
    () => isZeroCase(props.boundaryRight)
  );


  function verifyCase(
    element: string,
    disableFunc: React.Dispatch<React.SetStateAction<boolean>>,
    setFunc: (value: string) => void,
    setIncidenceFunc: (value: number) => void
  ) {
    setFunc(element);
    if (element !== "0;0" && element !== "0;99999999999999999999") {
      disableFunc(false);
    } else {
      disableFunc(true);
      setIncidenceFunc(0);
    }
  }

  return (
    <div className="Modal-overlay Modal-overlayC">
      <h2 className="Title">Condições de Contorno</h2>
      <div className="ModalC">
        <div className="Row-container">
          <div className="Col-container">
            <p className="Subtitle">Esquerda</p>
            <p className="Subtitle">x = 0</p>
            <select
              className="Picker"
              value={props.boundaryLeft}
              onChange={(event) => {
                verifyCase(
                  event.target.value,
                  setDisabledLeft,
                  props.setBoundaryLeft,
                  props.setIncidenceLeft
                );
              }}
            >
              <option value="0;0">Reflexiva</option>
              <option value="0;99999999999999999999">Fluxo escalar nulo</option>
              <option value="1.33333333333;0.66666666666">
                Fluxo direcional incidente
              </option>
              <option value="1;0.5">Tipo Corrente Parcial Incidente</option>
              <option value="1.15470053838;0.57735026919">
                Tipo Fluxo Angular S2 Incidente
              </option>
            </select>
            <div>
              <p className="Subtitle">Incidência</p>
              <FormInput
                disabled={disabledLeft}
                label=""
                placeholder="Informe a incidência em x = 0."
                onChange={(value) => props.setIncidenceLeft(Number(value))}
                value={String(props.incidenceLeft)}
              />
            </div>
          </div>
          <div className="Col-container">
            <p className="Subtitle">Direita</p>
            <p className="Subtitle">x = {props.L}</p>
            <select
              className="Picker"
              value={props.boundaryRight}
              onChange={(event) => {
                verifyCase(
                  event.target.value,
                  setDisabledRight,
                  props.setBoundaryRight,
                  props.setIncidenceRight
                );
              }}
            >
              <option value="0;0">Reflexiva</option>
              <option value="0;99999999999999999999">Fluxo escalar nulo</option>
              <option value="1.33333333333;0.66666666666">
                Fluxo direcional incidente
              </option>
              <option value="1;0.5">Tipo Corrente Parcial Incidente</option>
              <option value="1.15470053838;0.57735026919">
                Tipo Fluxo Angular S2 Incidente
              </option>
            </select>
            <div>
              <p className="Subtitle">Incidência</p>
              <FormInput
                disabled={disabledRight}
                label=""
                placeholder={`Informe a incidência em x = ${props.L}.`}
                onChange={(value) => props.setIncidenceRight(Number(value))}
                value={String(props.incidenceRight)}
              />
            </div>
          </div>
        </div>
        <div className="Button-container">
          <input
            className="Continue-button"
            type="button"
            onClick={props.successFunc}
            value={"Executar"}
          />
        </div>
      </div>
    </div>
  );
}

export default BoundaryModal;
