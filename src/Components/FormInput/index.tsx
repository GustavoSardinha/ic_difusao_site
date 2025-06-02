import React from "react";
import "../../Styles/FormInput/Input.css";

interface FormInputProps {
  label: string;
  placeholder?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function FormInput(props: FormInputProps) {
  function onChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    props.onChange(text.replace(/[^0-9]/g, ""));
  }

  return (
    <div className="Input-container">
      <p className="Input-label">{props.label}</p>
      <input
        disabled={props.disabled}
        type="text"
        className="Form-Input"
        placeholder={props.placeholder}
        onChange={onChanged}
        value={props.value}
      />
    </div>
  );
}

export default FormInput;
