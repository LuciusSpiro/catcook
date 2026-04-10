import { useState } from "react";

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
          <svg viewBox="0 0 120 120" width="120" height="120">
            {/* Chef hat */}
            <ellipse cx="60" cy="18" rx="22" ry="14" fill="white" stroke="#e0e0e0" strokeWidth="1.5" />
            <ellipse cx="50" cy="12" rx="6" ry="8" fill="white" />
            <ellipse cx="60" cy="9" rx="6" ry="9" fill="white" />
            <ellipse cx="70" cy="12" rx="6" ry="8" fill="white" />
            <rect x="40" y="18" width="40" height="12" rx="2" fill="white" stroke="#e0e0e0" strokeWidth="1.5" />
            {/* Cat face */}
            <circle cx="60" cy="65" r="30" fill="#ff6b6b" />
            {/* Ears */}
            <polygon points="34,45 26,18 48,38" fill="#ff6b6b" />
            <polygon points="86,45 94,18 72,38" fill="#ff6b6b" />
            <polygon points="36,43 30,22 46,38" fill="#ffb3b3" />
            <polygon points="84,43 90,22 74,38" fill="#ffb3b3" />
            {/* Eyes */}
            <ellipse cx="48" cy="60" rx="5" ry="5.5" fill="white" />
            <ellipse cx="72" cy="60" rx="5" ry="5.5" fill="white" />
            <circle cx="49" cy="61" r="3" fill="#2d2d2d" />
            <circle cx="73" cy="61" r="3" fill="#2d2d2d" />
            <circle cx="50" cy="59.5" r="1" fill="white" />
            <circle cx="74" cy="59.5" r="1" fill="white" />
            {/* Nose */}
            <ellipse cx="60" cy="70" rx="3" ry="2" fill="#e05555" />
            {/* Mouth */}
            <path d="M54,74 Q60,80 66,74" fill="none" stroke="#e05555" strokeWidth="1.5" strokeLinecap="round" />
            {/* Whiskers */}
            <line x1="20" y1="64" x2="42" y2="67" stroke="#2d2d2d" strokeWidth="1" opacity="0.5" />
            <line x1="20" y1="70" x2="42" y2="70" stroke="#2d2d2d" strokeWidth="1" opacity="0.5" />
            <line x1="78" y1="67" x2="100" y2="64" stroke="#2d2d2d" strokeWidth="1" opacity="0.5" />
            <line x1="78" y1="70" x2="100" y2="70" stroke="#2d2d2d" strokeWidth="1" opacity="0.5" />
            {/* Blush */}
            <circle cx="40" cy="72" r="5" fill="#ffb3b3" opacity="0.5" />
            <circle cx="80" cy="72" r="5" fill="#ffb3b3" opacity="0.5" />
          </svg>
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
