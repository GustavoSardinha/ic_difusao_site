import React from "react";
import "../../Styles/CheckBox/checkbox.css";

interface CheckBoxInputProps{
    onChange: (val: boolean) => void;
    value: boolean;
    text: string;
}
function CheckBoxInput(props: CheckBoxInputProps){
    return(
    <div className="Check-Container">
        <input
        className="Check"
        type='checkbox'
        checked={props.value}
        onChange={(event) => {props.onChange(event.target.checked)}}
        ></input>
         <label className="Label">{props.text}</label>
    </div>
    )
}

export default CheckBoxInput;