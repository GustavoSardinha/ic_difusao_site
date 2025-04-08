import React from "react";
import "../../Styles/FormInput/Input.css";
import AlertDialogButton from "../AlertDialog";

function ArrayFormInput(props) {

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
                msgAlert = {props.msgAlert}
                exAlert = {props.exAlert}
                ></AlertDialogButton>
            </div>
        </div>
    );
}

export default ArrayFormInput;