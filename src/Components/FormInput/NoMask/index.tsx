import React from "react";
import "../../../Styles/FormInput/Input.css";
import FormInputProps from "../interface/FormInputProps";

function FormInputNoMask(props: FormInputProps) {
  return (
    <div className="Input-container">
      <p className="Input-label">{props.label}</p>
      <input
        disabled={props.disabled}
        type="text"
        className="Form-Input"
        onChange={(event) => {props.onChange(event.target.value);}}
        placeholder={props.placeholder}
        value={props.value}
      />
    </div>
  );
}

export default FormInputNoMask;
