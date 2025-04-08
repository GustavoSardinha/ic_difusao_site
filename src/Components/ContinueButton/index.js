import React, { useState } from "react";
import "../../Styles/App.css";
import Modal from "../Modal";
import ErrorImg from "../../img/icons/error.png"

function ContinueButton(props) {
    const [showModal, setShowModal] = useState(false);
    function onClick(){
        props.onClick();
        if(props.err !=null){
            setShowModal(true);
        }
    }
    return (
        <div>
          <div className='Input-container'>
            <input 
            type="button"
            value="Prosseguir"
            className="Continue-button"
            onClick={onClick}
            />
          </div>
          {showModal && (
                <Modal
                title = "ERRO!"
                icon =  {ErrorImg}
                msgAlert = {props.err.message}
                exAlert = {""}
                onClick = {() => setShowModal(false)}
                ></Modal>
            )}
        </div>
    );
}

export default ContinueButton;