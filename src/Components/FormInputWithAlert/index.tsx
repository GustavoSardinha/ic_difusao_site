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
    props.onChange(text.replace(/[^0-9]/g, ""));
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
        <AlertDialogButton
            msgAlert={props.msgAlert}
            exAlert={props.exAlert}
        />
      </div>
    </div>
  );
}

export default FormInputWithAlert;
