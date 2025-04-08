import React, {useState} from "react";
import "../../Styles/Modal/Modal.css";
import "../../Styles/Modal/Contorno.css";
import "../../Styles/FormInput/Input.css";
import FormInput from "../FormInput";

function ContornoModal(props) {
    const [disabledEsq, setDisabledEsq] = useState(true);
    const [disabledDir, setDisabledDir] = useState(true);

    function verifyCase(element, disableFunc, setFunc, setIncidenciaFunc){
        setFunc(element);
        if(element != "0;0" && element != "0;999999999999")
            disableFunc(false);
        else{
            disableFunc(true);
            setIncidenciaFunc(0);
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
                <select className="Picker"
                value={props.contornoEsq}
                onChange={(event) => {verifyCase(event.target.value, setDisabledEsq, props.setContornoEsq, props.setIncidenciaEsq)}}
                >
                    <option value="0;0">Reflexiva</option>
                    <option value="0;999999999999">Fluxo escalar nulo</option>
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
                    disabled = {disabledEsq}
                    label=""
                    placeholder="Informe a incidência em x = 0."
                    onChange={(value) => props.setIncidenciaEsq(value)}
                    value={props.incidenciaEsq}
                    />
                </div>
            </div>
            <div className="Col-container">
                <p className="Subtitle">Direita</p>
                <p className="Subtitle">x = {props.L}</p>
                <select className="Picker"
                value={props.contornoDir}
                onChange={(event) => {verifyCase(event.target.value, setDisabledDir, props.setContornoDir, props.setIncidenciaDir)}}
                >
                    <option value="0;0">Reflexiva</option>
                    <option value="0;999999999999">Fluxo escalar nulo</option>
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
                    disabled = {disabledDir}
                    label=""
                    placeholder={`Informe a incidência em x = ${props.L}.`}
                    onChange={(value) => props.setIncidenciaDir(value)}
                    value={props.incidenciaDir}
                    />

                </div>
            </div>
        </div>
        <div className="Button-container">
            <input
            className="Continue-button"
            type="button"
            value={"Executar"}></input>
        </div>
      </div>
    </div>
  );
}

export default ContornoModal;
