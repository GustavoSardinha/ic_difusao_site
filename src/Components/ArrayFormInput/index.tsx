import React from "react";
import "../../Styles/FormInput/Input.css";
import AlertDialogButton from "../AlertDialog";

interface ArrayFormInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  msgAlert?: string;
  exAlert?: string;
}

function ArrayFormInput(props: ArrayFormInputProps) {
  return (
    <div className="Input-container">
      <p className="Input-label">{props.label}</p>
      <div className="Input-line">
        <input
          type="text"
          className="Form-Input"
          placeholder={props.placeholder}
          onChange={props.onChange}
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

export default ArrayFormInput;
