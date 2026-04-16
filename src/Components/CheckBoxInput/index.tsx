import React from "react";
import "../../Styles/CheckBox/checkbox.css";

interface CheckBoxInputProps{
    onChange: (val: boolean) => void;
    value: boolean;
    text: string;
}
function CheckBoxInput(props: CheckBoxInputProps){
    return(
    <div className="switch-container">
        <label className="switch">
            <input 
            type="checkbox" 
            checked={props.value}
            onChange={(e) => props.onChange(e.target.checked)}
            />
            <span className="slider"></span>
        </label>
        <span className="switch-label">{props.text}</span>
    </div>
    )
}

export default CheckBoxInput;