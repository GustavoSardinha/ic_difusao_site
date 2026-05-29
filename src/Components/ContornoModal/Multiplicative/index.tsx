import React, { useRef } from "react";
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
  successFunc: (
    contornoEsq: string,
    contornoDir: string
  ) => void;
  Lkeff: string;
  setLKeff: (value: string) => void
  Lfluxo: string;
  setLfluxo: (value: string) => void;
  msgErroDialog: string;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  criterioParada: boolean;
  setCriterioParada: (value: boolean) => void;
  albedoL: boolean;
  setAlbedoL: (value: boolean) => void;
  albedoR: boolean;
  setAlbedoR: (value: boolean) => void;
  inf_bL: boolean;
  setInf_bL: (value: boolean) => void;
  inf_bR: boolean;
  setInf_bR: (value: boolean) => void;
  passos: number;
  setPassos: (value: number) => void;
  setCCActive: (value: boolean) => void;
  aL:string;
  setAL: (value: string) => void;
  bL:string;
  setBL: (value: string) => void;
  aR:string;
  setAR: (value: string) => void;
  bR:string;
  setBR: (value: string) => void;
  coefDifusaoRefL: string;
  setCoefDifuRefL: (value: string) => void;
  coefDifusaoRefR: string;
  setCoefDifuRefR: (value: string) => void;
  coefChoqueRefL: string;
  setCoefChoqueRefL: (value: string) => void;
  coefChoqueRefR: string;
  setCoefChoqueRefR: (value: string) => void;
  coefDifusaoBaffL: string;
  setCoefDifuBaffL: (value: string) => void;
  coefDifusaoBaffR: string;
  setCoefDifuBaffR: (value: string) => void;
  coefChoqueBaffL: string;
  setCoefChoqueBaffL: (value: string) => void;
  coefChoqueBaffR: string;
  setCoefChoqueBaffR: (value: string) => void;
  baffleL: boolean;
  setBafflebL: (value: boolean) => void;
  baffleR: boolean;
  setBaffleR: (value: boolean) => void;
}

function ContornoModal(props: ContornoModalProps) {
  const contornoEsqRef = useRef<HTMLSelectElement>(null);
  const contornoDirRef = useRef<HTMLSelectElement>(null);

  return (
    <div className="Modal-overlay Modal-overlayC">
      <h2 className="Title">Condições de Contorno</h2>
      <div className="ModalC">
        <div className="Row-container">
          <div className="Col-container">
            <p className="Subtitle">Esquerda</p>
            <p className="Subtitle">x = 0</p>
            <select
              ref={contornoEsqRef}
              className="Picker"
              value={props.contornoEsq}
              onChange={(event) => {props.setContornoEsq(event.target.value)}}>
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
              ref={contornoDirRef}
              className="Picker"
              value={props.contornoDir}
              onChange={(event) => {props.setContornoDir(event.target.value)}}
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
                    <p className="Subtitle">Informe o comprimento do baffle</p>
                    <FormInputNoMask
                        disabled={false}
                        label=""
                        placeholder={`Digite o comprimento do baffle`}
                        onChange={(value) => props.setAL(value)}
                        value={String(props.aL)}
                    />
                  </div>
                )}
                {(!props.inf_bL) && (
                  <div>
                    <p className="Subtitle">Informe o comprimento do refletor </p>
                    <FormInputNoMask
                        disabled={props.inf_bL}
                        label=""
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
                <p className="Subtitle">Informe o coeficiente de difusão do refletor</p>
                  <FormInputNoMask
                      disabled={false}
                      label=""
                      placeholder={`Digite os coeficientes de difusão`}
                      onChange={(value) => props.setCoefDifuRefL(value)}
                      value={String(props.coefDifusaoRefL)}
                  />
                <p className="Subtitle">Informe a seção de choque macroscópica do refletor</p>
                  <FormInputNoMask
                      disabled={false}
                      label=""
                      placeholder={`Digite as seções de choque macroscópicas`}
                      onChange={(value) => props.setCoefChoqueRefL(value)}
                      value={String(props.coefChoqueRefL)}
                  />
                {(props.baffleL) && (
                  <div>
                    <p className="Subtitle">Informe o coeficiente de difusão do baffle</p>
                    <FormInputNoMask
                        disabled={false}
                        label=""
                        placeholder={`Digite os coeficientes de difusão`}
                        onChange={(value) => props.setCoefDifuBaffL(value)}
                        value={String(props.coefDifusaoBaffL)}
                    />
                  <p className="Subtitle">Informe a seção de choque macroscópica do baffle</p>
                    <FormInputNoMask
                        disabled={false}
                        label=""
                        placeholder={`Digite as seções de choque macroscópicas`}
                        onChange={(value) => props.setCoefChoqueBaffL(value)}
                        value={String(props.coefChoqueBaffL)}
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
                        <p className="Subtitle">Informe o comprimento do baffle</p>
                        <FormInputNoMask
                            disabled={false}
                            label=""
                            placeholder={`Digite o comprimento do baffle`}
                            onChange={(value) => props.setAR(value)}
                            value={String(props.aR)}
                        />
                      </div>
                    )}
                  {(!props.inf_bR) && (
                    <div>
                      <p className="Subtitle">Informe o comprimento do refletor </p>
                      <FormInputNoMask
                          disabled={props.inf_bR}
                          label=""
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
                  <p className="Subtitle">Informe o coeficiente de difusão do refletor</p>
                  <FormInputNoMask
                      disabled={false}
                      label=""
                      placeholder={`Digite os coeficientes de difusão`}
                      onChange={(value) => props.setCoefDifuRefR(value)}
                      value={String(props.coefDifusaoRefR)}
                  />
                  <p className="Subtitle">Informe a seção de choque macroscópica do refletor</p>
                  <FormInputNoMask
                      disabled={false}
                      label=""
                      placeholder={`Digite as seções de choque macroscópicas`}
                      onChange={(value) => props.setCoefChoqueRefR(value)}
                      value={String(props.coefChoqueRefR)}
                  />
                  {(props.baffleR) && (
                    <div>
                      <p className="Subtitle">Informe o coeficiente de difusão do baffle</p>
                      <FormInputNoMask
                          disabled={false}
                          label=""
                          placeholder={`Digite os coeficientes de difusão`}
                          onChange={(value) => props.setCoefDifuBaffR(value)}
                          value={String(props.coefDifusaoBaffR)}
                      />
                      <p className="Subtitle">Informe a seção de choque macroscópica do baffle</p>
                      <FormInputNoMask
                          disabled={false}
                          label=""
                          placeholder={`Digite as seções de choque macroscópicas`}
                          onChange={(value) => props.setCoefChoqueBaffR(value)}
                          value={String(props.coefChoqueBaffR)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {(!props.criterioParada) && (
            <div  className="Div-row">
                <div>
                  <p className="Subtitle">Critério de parada para keff</p>
                  <FormInputNoMask
                      disabled={false}
                      label=""
                      placeholder={`Informe o críterio de parada para keff`}
                      onChange={(value) => props.setLKeff(value)}
                      value={String(props.Lkeff)}
                  />
                </div>
                <div>
                  <p className="Subtitle">Critério de parada para fluxo</p>
                  <FormInputNoMask
                      disabled={false}
                      label=""
                      placeholder={`Informe o críterio de parada para o fluxo`}
                      onChange={(value) => props.setLfluxo(value)}
                      value={String(props.Lfluxo)}
                  />
                </div>
            </div>
          )}
          {(props.criterioParada) && (
            <div>
              <p className="Subtitle">Número fixo de iterações</p>
              <FormInput
                disabled={false}
                label=""
                placeholder={`Informe o número fixo de iterações`}
                onChange={(value) => props.setPassos(Number(value))}
                value={String(props.passos)}
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
                const contornoEsqAtual = contornoEsqRef.current?.value ?? "0;0";
                const contornoDirAtual = contornoDirRef.current?.value ?? "0;0";

                props.setContornoEsq(contornoEsqAtual);
                props.setContornoDir(contornoDirAtual);

              
                props.successFunc(
                  contornoEsqAtual,
                  contornoDirAtual
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
            value = {props.criterioParada}
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

export default ContornoModal;
