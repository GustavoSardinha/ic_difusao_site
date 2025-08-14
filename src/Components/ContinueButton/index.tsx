import React, { useState } from "react";
import Modal from "../Modal";
import ErrorImg from "../../img/icons/error.png";

interface ContinueButtonProps {
  onClick: (onError: (err: Error) => void) => void;
  err: Error | null; 
}

function ContinueButton(props: ContinueButtonProps) {
  const [showModal, setShowModal] = useState(false);

function handleClick() {
  props.onClick((err: Error) => {
    if (err != null) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  });
}

  return (
    <div>
      <div className="Input-container">
        <input
          type="button"
          value="Prosseguir"
          className="Continue-button"
          onClick={handleClick}
        />
      </div>
      {showModal && props.err && (
        <Modal
          title="ERRO!"
          icon={ErrorImg}
          msgAlert={props.err.message}
          exAlert={""}
          onClick={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default ContinueButton;
