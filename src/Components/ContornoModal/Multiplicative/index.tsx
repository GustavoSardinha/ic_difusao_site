import React, { useState } from "react";
import "../../../Styles/Modal/Modal.css";
import "../../../Styles/Modal/Contorno.css";
import "../../../Styles/FormInput/Input.css";
import FormInput from "../../FormInput";

interface ContornoModalProps {
  contornoEsq: string;
  setContornoEsq: (value: string) => void;
  contornoDir: string;
  setContornoDir: (value: string) => void;
  L: number;
  successFunc: () => void;
  Lkeff: number;
  setLKeff: (value: number) => void
  Lfluxo: number;
  setLfluxo: (value: number) => void;

}

function ContornoModal(props: ContornoModalProps) {

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
              value={props.contornoEsq}
              onChange={(event) => {props.setContornoEsq(event.target.value)}}>
              <option value="0;0">Reflexiva</option>
              <option value="0;99999999999999999999">Fluxo escalar nulo</option>
              <option value="1.33333333333;0.66666666666">Vácuo</option>
            </select>
          </div>
          <div className="Col-container">
            <p className="Subtitle">Direita</p>
            <p className="Subtitle">x = {props.L}</p>
            <select
              className="Picker"
              value={props.contornoDir}
              onChange={(event) => {props.setContornoDir(event.target.value)}}
            >
              <option value="0;0">Reflexiva</option>
              <option value="0;99999999999999999999">Fluxo escalar nulo</option>
              <option value="1.33333333333;0.66666666666">Vácuo</option>
            </select>
          </div>
        </div>
        <div>
            <div>
                <p className="Subtitle">Critério de parada para keff</p>
                <FormInput
                    disabled={false}
                    label=""
                    placeholder={`Informe o críterio de parada para keff:`}
                    onChange={(value) => props.setLKeff(Number(value))}
                    value={String(props.Lkeff)}
                />
            </div>
            <div>
                <p className="Subtitle">Critério de parada para fluxo</p>
                <FormInput
                    disabled={false}
                    label=""
                    placeholder={`Informe o críterio de parada para o fluxo:`}
                    onChange={(value) => props.setLfluxo(Number(value))}
                    value={String(props.Lfluxo)}
                />
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

export default ContornoModal;
