import React from "react";
import "../../Styles/Modal/Modal.css";

function Modal({ icon, title, msgAlert, exAlert, onClick }) {
  // Função para destacar o texto entre *asteriscos*
  function mark(text) {
    return text.split("*").map((segment, i) =>
      i % 2 === 1 ? <strong key={i}>{segment}</strong> : segment
    );
  }

  return (
    <div className="Modal-overlay">
      <div className="Modal">
        <div className="Title-container">
          <img src={icon} className="Icon" alt="" />
          <h2>{title}</h2>
        </div>
        <p className="Main-content">{mark(msgAlert)}</p>
        <p>{exAlert}</p>
        <input
          type="button"
          value="OK"
          className="Close-button"
          onClick={onClick}
        />
      </div>
    </div>
  );
}


export default Modal;
