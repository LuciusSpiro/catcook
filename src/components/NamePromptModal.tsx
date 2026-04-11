import { useState } from "react";
import logo from "../assets/logo.png";

interface NamePromptModalProps {
  onSubmit: (name: string) => void;
}

export default function NamePromptModal({ onSubmit }: NamePromptModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal name-prompt-modal">
        <div className="name-prompt__cat">
          <img src={logo} alt="CatCook" width="180" />
        </div>
        <h2 className="name-prompt__title">Willkommen bei CatCook!</h2>
        <p className="name-prompt__text">
          Miau! Wie heißt du, Küchenkätzchen?
        </p>
        <form onSubmit={handleSubmit} className="name-prompt__form">
          <input
            type="text"
            className="name-prompt__input"
            placeholder="Dein Name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            maxLength={30}
          />
          <button
            type="submit"
            className="name-prompt__btn"
            disabled={!name.trim()}
          >
            Los geht's! 🐾
          </button>
        </form>
      </div>
    </div>
  );
}
