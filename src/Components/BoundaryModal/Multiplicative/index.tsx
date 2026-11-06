import React, { useRef } from "react";
import "../../../Styles/Modal/Modal.css";
import "../../../Styles/Modal/Contorno.css";
import "../../../Styles/FormInput/Input.css";
import FormInputNoMask from "../../FormInput/NoMask";
import Modal from "../../Modal";
import AlertIcon from "../../../img/icons/error.png";
import CheckBoxInput from "../../CheckBoxInput";
import FormInput from "../../FormInput";


interface BoundaryModalProps {
  boundaryLeft: string;
  setBoundaryLeft: (value: string) => void;
  boundaryRight: string;
  setBoundaryRight: (value: string) => void;
  L: number;
  successFunc: (
    boundaryLeft: string,
    boundaryRight: string
  ) => void;
  keffTolerance: string;
  setKeffTolerance: (value: string) => void
  fluxTolerance: string;
  setFluxTolerance: (value: string) => void;
  msgErroDialog: string;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  stoppingCriterion: boolean;
  setCriterioParada: (value: boolean) => void;
  albedoL: boolean;
  setAlbedoL: (value: boolean) => void;
  albedoR: boolean;
  setAlbedoR: (value: boolean) => void;
  inf_bL: boolean;
  setInf_bL: (value: boolean) => void;
  inf_bR: boolean;
  setInf_bR: (value: boolean) => void;
  steps: number;
  setSteps: (value: number) => void;
  setCCActive: (value: boolean) => void;
  aL:string;
  setAL: (value: string) => void;
  bL:string;
  setBL: (value: string) => void;
  aR:string;
  setAR: (value: string) => void;
  bR:string;
  setBR: (value: string) => void;
  coefDiffusionRefL: string;
  setCoefDiffusionRefL: (value: string) => void;
  coefDiffusionRefR: string;
  setCoefDiffusionRefR: (value: string) => void;
  coefCrossSectionRefL: string;
  setCoefCrossSectionRefL: (value: string) => void;
  coefCrossSectionRefR: string;
  setCoefCrossSectionRefR: (value: string) => void;
  coefDiffusionBaffL: string;
  setCoefDiffusionBaffL: (value: string) => void;
  coefDiffusionBaffR: string;
  setCoefDiffusionBaffR: (value: string) => void;
  coefCrossSectionBaffL: string;
  setCoefCrossSectionBaffL: (value: string) => void;
  coefCrossSectionBaffR: string;
  setCoefCrossSectionBaffR: (value: string) => void;
  baffleL: boolean;
  setBafflebL: (value: boolean) => void;
  baffleR: boolean;
  setBaffleR: (value: boolean) => void;
}
function copyData(props: BoundaryModalProps) {
  props.setBoundaryRight(props.boundaryLeft);
  props.setInf_bR(props.inf_bL);
  props.setAlbedoR(props.albedoL);
  props.setBaffleR(props.baffleL);
  props.setAR(props.aL);
  props.setBR(props.bL);
  props.setCoefDiffusionRefR(props.coefDiffusionRefL);
  props.setCoefDiffusionBaffR(props.coefDiffusionBaffL);
  props.setCoefCrossSectionRefR(props.coefCrossSectionRefL);
  props.setCoefCrossSectionBaffR(props.coefCrossSectionBaffL);
}
function BoundaryModal(props: BoundaryModalProps) {
  const boundaryLeftRef = useRef<HTMLSelectElement>(null);
  const boundaryRightRef = useRef<HTMLSelectElement>(null);

  return (
    <div className="Modal-overlay Modal-overlayC">
      <h2 className="Title">Condições de Contorno</h2>
      <div className="ModalC">
        <div className="Row-container">
          <div className="Col-container">
            <p className="Subtitle">Esquerda</p>
            <p className="Subtitle">x = 0</p>
            <select
              ref={boundaryLeftRef}
              className="Picker"
              value={props.boundaryLeft}
              onChange={(event) => {props.setBoundaryLeft(event.target.value)}}>
              {(!props.albedoL) && (
                <option value="0;0">Reflexiva</option>
              )}
              <option value="0;99999999999999999999">Fluxo escalar nulo</option>
              <option value="0.5;0.5">Vácuo</option>
            </select>
          </div>
          <div className="Col-container">
            <p className="Subtitle">Direita</p>
            <p className="Subtitle">x = {props.L}</p>
            <select
              ref={boundaryRightRef}
              className="Picker"
              value={props.boundaryRight}
              onChange={(event) => {props.setBoundaryRight(event.target.value)}}
            >
              {(!props.albedoR) && (
                <option value="0;0">Reflexiva</option>
              )}
              <option value="0;99999999999999999999">Fluxo escalar nulo</option>
              <option value="0.5;0.5">Vácuo</option>
            </select>
          </div>
        </div>
        <div>
        <div className="Div-row">
          <CheckBoxInput
            text = {"Condição de contorno do tipo albedo"}
            value = {props.albedoL}
            onChange = {props.setAlbedoL}
          />
          <CheckBoxInput
            text = {"Condição de contorno do tipo albedo"}
            value = {props.albedoR}
            onChange = {props.setAlbedoR}
          />
        </div>
        <div className="Div-row">
          <div  className="Div-col">
            {(props.albedoL) && (
                <div>
                  <CheckBoxInput
                  text = {"Baffle implícito"}
                  value = {props.baffleL}
                  onChange = {props.setBafflebL}
                  />
                {(props.baffleL) && (
                  <div>
                    <FormInputNoMask
                        disabled={false}
                        label="Informe o comprimento do baffle"
                        placeholder={`Digite o comprimento do baffle`}
                        onChange={(value) => props.setAL(value)}
                        value={String(props.aL)}
                    />
                  </div>
                )}
                {(!props.inf_bL) && (
                  <div>
                    <FormInputNoMask
                        disabled={props.inf_bL}
                        label="Informe o comprimento do refletor"
                      placeholder={`Digite o comprimento do refletor`}
                      onChange={(value) => props.setBL(value)}
                      value={String(props.bL)}
                  />
                </div>
                )}
                <CheckBoxInput
                  text = {"Refletor infinito"}
                  value = {props.inf_bL}
                  onChange = {props.setInf_bL}
                />
                  <FormInputNoMask
                      disabled={false}
                      label="Informe o coeficiente de difusão do refletor"
                      placeholder={`Digite os coeficientes de difusão`}
                      onChange={(value) => props.setCoefDiffusionRefL(value)}
                      value={String(props.coefDiffusionRefL)}
                  />
                  <FormInputNoMask
                      disabled={false}
                      label="Informe a seção de choque macroscópica do refletor"
                      placeholder={`Digite as seções de choque macroscópicas`}
                      onChange={(value) => props.setCoefCrossSectionRefL(value)}
                      value={String(props.coefCrossSectionRefL)}
                  />
                {(props.baffleL) && (
                  <div>
                    <FormInputNoMask
                        disabled={false}
                        label="Informe o coeficiente de difusão do baffle"
                        placeholder={`Digite os coeficientes de difusão`}
                        onChange={(value) => props.setCoefDiffusionBaffL(value)}
                        value={String(props.coefDiffusionBaffL)}
                    />
                    <FormInputNoMask
                        disabled={false}
                        label="Informe a seção de choque macroscópica do baffle"
                        placeholder={`Digite as seções de choque macroscópicas`}
                        onChange={(value) => props.setCoefCrossSectionBaffL(value)}
                        value={String(props.coefCrossSectionBaffL)}
                    />
                  </div>
                )}
                </div>
              )}
            </div>
            <div  className="Div-col">
              {(props.albedoR) && (
                  <div>
                    <CheckBoxInput
                    text = {"Baffle implícito"}
                    value = {props.baffleR}
                    onChange = {props.setBaffleR}
                    />
                    {(props.baffleR) && (
                      <div>
                        <FormInputNoMask
                            disabled={false}
                            label="Informe o comprimento do baffle"
                            placeholder={`Digite o comprimento do baffle`}
                            onChange={(value) => props.setAR(value)}
                            value={String(props.aR)}
                        />
                      </div>
                    )}
                  {(!props.inf_bR) && (
                    <div>
                      <FormInputNoMask
                          disabled={props.inf_bR}
                          label="Informe o comprimento do refletor"
                          placeholder={`Digite o comprimento do refletor`}
                        onChange={(value) => props.setBR(value)}
                        value={String(props.bR)}
                    />
                  </div>
                  )}
                  <CheckBoxInput
                    text = {"Refletor infinito"}
                    value = {props.inf_bR}
                    onChange = {props.setInf_bR}
                  />
                  <FormInputNoMask
                      disabled={false}
                      label="Informe o coeficiente de difusão do refletor"
                      placeholder={`Digite os coeficientes de difusão`}
                      onChange={(value) => props.setCoefDiffusionRefR(value)}
                      value={String(props.coefDiffusionRefR)}
                  />
                  <FormInputNoMask
                      disabled={false}
                      label="Informe a seção de choque macroscópica do refletor"
                      placeholder={`Digite as seções de choque macroscópicas`}
                      onChange={(value) => props.setCoefCrossSectionRefR(value)}
                      value={String(props.coefCrossSectionRefR)}
                  />
                  {(props.baffleR) && (
                    <div>
                      <FormInputNoMask
                          disabled={false}
                          label="Informe o coeficiente de difusão do baffle"
                          placeholder={`Digite os coeficientes de difusão`}
                          onChange={(value) => props.setCoefDiffusionBaffR(value)}
                          value={String(props.coefDiffusionBaffR)}
                      />
                      <FormInputNoMask
                          disabled={false}
                          label="Informe a seção de choque macroscópica do baffle"
                          placeholder={`Digite as seções de choque macroscópicas`}
                          onChange={(value) => props.setCoefCrossSectionBaffR(value)}
                          value={String(props.coefCrossSectionBaffR)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {(!props.stoppingCriterion) && (
            <div  className="Div-row">
                <div>
                  <FormInputNoMask
                      disabled={false}
                      label="Informe o critério de parada para keff"
                      placeholder={`Digite o critério de parada para keff`}
                      onChange={(value) => props.setKeffTolerance(value)}
                      value={String(props.keffTolerance)}
                  />
                </div>
                <div>
                  <FormInputNoMask
                      disabled={false}
                      label="Informe o critério de parada para fluxo"
                      placeholder={`Digite o critério de parada para o fluxo`}
                      onChange={(value) => props.setFluxTolerance(value)}
                      value={String(props.fluxTolerance)}
                  />
                </div>
            </div>
          )}
          <button className="Continue-button" onClick={() => copyData(props)}>Copiar dados da esquerda para a direita</button>
          {(props.stoppingCriterion) && (
            <div>
              <p className="Subtitle">Número fixo de iterações</p>
              <FormInput
                disabled={false}
                label="Informe o número fixo de iterações"
                placeholder={`Digite o número fixo de iterações`}
                onChange={(value) => props.setSteps(Number(value))}
                value={String(props.steps)}
              ></FormInput>
            </div>
          )
          }
        </div>
        <div className="Div-buttons">
          <div className="Button-container">
            <input
              className="Continue-button"
              type="button"
              onClick={() => {
                const boundaryLeftCurrent = boundaryLeftRef.current?.value ?? "0;0";
                const boundaryRightCurrent = boundaryRightRef.current?.value ?? "0;0";

                props.setBoundaryLeft(boundaryLeftCurrent);
                props.setBoundaryRight(boundaryRightCurrent);


                props.successFunc(
                  boundaryLeftCurrent,
                  boundaryRightCurrent
                );
              }}
              value={"Executar"}
            />
          </div>
          <div className="Button-container">
            <input
              className="Continue-button"
              type="button"
              onClick={() => props.setCCActive(false)}
              value={"Fechar"}
            />
          </div>
        </div>
        <div className="Div-row">
          <CheckBoxInput
            text = {"Critério de parada fixo"}
            value = {props.stoppingCriterion}
            onChange = {props.setCriterioParada}
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

export default BoundaryModal;
