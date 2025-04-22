import React from "react";
import "../../Styles/CheckBox/checkbox.css";


function CheckBoxInput(props){
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