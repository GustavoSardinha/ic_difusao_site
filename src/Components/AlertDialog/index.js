import React, { useState } from "react";
import "../../Styles/FormInput/Input.css";
import Modal from "../Modal";
import AlertImg from "../../img/icons/alert.png"

function AlertDialogButton(props) {
    const [showModal, setShowModal] = useState(false);
    return (
        <div>
            <input 
            className= "Doubt-button" 
            type="button" 
            value={"?"}
            onClick={() => setShowModal(true)}/>
            {showModal && (
                <Modal
                title = "ATENÇÃO!"
                icon = {AlertImg}
                msgAlert = {props.msgAlert}
                exAlert = {props.exAlert}
                onClick = {() => setShowModal(false)}
                ></Modal>
            )}
        </div>
    );
}

export default AlertDialogButton;