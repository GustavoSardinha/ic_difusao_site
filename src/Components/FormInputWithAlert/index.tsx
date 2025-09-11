import React from "react";
import "../../Styles/FormInput/Input.css";
import AlertDialogButton from "../AlertDialog";

interface FormInputWithAlerProps {
  label: string;
  placeholder?: string;
  value: string;
  disabled?: boolean;
  msgAlert: string;
  exAlert: string;
  onChange: (value: string) => void;
}

function FormInputWithAlert(props: FormInputWithAlerProps) {
  function onChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;

    // remove tudo que não for dígito ou ponto
    const onlyNumsAndDots = text.replace(/[^0-9.]/g, "");

    // separa pela primeira ocorrência do ponto e junta o restante (elimina pontos extras)
    const [intPart, ...rest] = onlyNumsAndDots.split(".");
    let cleaned = intPart + (rest.length ? "." + rest.join("") : "");

    // se começar com ".", transforma em "0."
    if (cleaned.startsWith(".")) cleaned = "0" + cleaned;

    // permite string vazia (para apagar o campo)
    props.onChange(cleaned);
  }

  return (
    <div className="Input-container">
      <p className="Input-label">{props.label}</p>
      <div className="Input-line">
        <input
          disabled={props.disabled}
          type="text"
          className="Form-Input"
          placeholder={props.placeholder}
          onChange={onChanged}
          value={props.value}
        />
        <AlertDialogButton msgAlert={props.msgAlert} exAlert={props.exAlert} />
      </div>
    </div>
  );
}

export default FormInputWithAlert;
