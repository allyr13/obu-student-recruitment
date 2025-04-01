import React, { useState } from "react";

const DeleteConfirmation = ({ onConfirm, onCancel }) => {
  const [input, setInput] = useState("");

  const handleConfirm = () => {
    onConfirm();
    setInput("");
  };

  return (
    <div className="overlay">
      <div className="modal">
        <h2>Permanently Delete Objects?</h2>
        <p>
          To confirm deletion, type <strong><em>permanently delete</em></strong> in the text input field.
        </p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
        />
        <div className="confirm-delete-buttons">
            <button className="cancel-button" onClick={() => { onCancel(); setInput(""); }}>Cancel</button>
            <div className="confirm-delete-spacer"></div>
            <button
                className={`action-button confirm-delete ${input !== "permanently delete" ? "disabled" : ""}`}
                onClick={handleConfirm}
                disabled={input !== "permanently delete"}
            >
                Confirm
            </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
