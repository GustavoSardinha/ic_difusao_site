import React, { useState } from "react";
import "../../../Styles/Modal/Modal.css";
import "../../../Styles/Modal/Contorno.css";
import "../../../Styles/FormInput/Input.css";
import FormInputNoMask from "../../FormInput/NoMask";
import Modal from "../../Modal";
import AlertIcon from "../../../img/icons/error.png";
import CheckBoxInput from "../../CheckBoxInput";
import FormInput from "../../FormInput";

interface ContornoModalProps {
  contornoEsq: string;
  setContornoEsq: (value: string) => void;
  contornoDir: string;
  setContornoDir: (value: string) => void;
  L: number;
  successFunc: () => void;
  Lkeff: string;
  setLKeff: (value: string) => void
  Lfluxo: string;
  setLfluxo: (value: string) => void;
  msgErroDialog: string;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  criterioParada: boolean;
  setCriterioParada: (value: boolean) => void;
  passos: number;
  setPassos: (value: number) => void;
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
              <option value="0.5;0.5">Vácuo</option>
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
              <option value="0.5;0.5">Vácuo</option>
            </select>
          </div>
        </div>
        <div>
          <CheckBoxInput
            text = {"Critério de parada fixo"}
            value = {props.criterioParada}
            onChange = {props.setCriterioParada}
          />
          {(!props.criterioParada) && (
            <div>
                <p className="Subtitle">Critério de parada para keff</p>
                <FormInputNoMask
                    disabled={false}
                    label=""
                    placeholder={`Informe o críterio de parada para keff:`}
                    onChange={(value) => props.setLKeff(value)}
                    value={String(props.Lkeff)}
                />
                <p className="Subtitle">Critério de parada para fluxo</p>
                <FormInputNoMask
                    disabled={false}
                    label=""
                    placeholder={`Informe o críterio de parada para o fluxo:`}
                    onChange={(value) => props.setLfluxo(value)}
                    value={String(props.Lfluxo)}
                />
            </div>
          )}
          {(props.criterioParada) && (
            <div>
              <p className="Subtitle">Número fixo de iterações</p>
              <FormInput
                disabled={false}
                label=""
                placeholder={`Informe o número fixo de iterações:`}
                onChange={(value) => props.setPassos(Number(value))}
                value={String(props.passos)}
              ></FormInput>
            </div>
          )
          }
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
      {props.showModal && (
        <Modal
          title="ATENÇÃO!"
          icon={AlertIcon}
          msgAlert={props.msgErroDialog}
          exAlert={""}
          onClick={() => props.setShowModal(false)}
        />
      )}
    </div>
  );
}

export default ContornoModal;
