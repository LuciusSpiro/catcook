import { useState } from "react";
import { ArrowLeft, Plus, LogOut, Trash2, Users, Edit2, Check, Eye, UserMinus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useHousehold } from "../context/HouseholdContext";
import { useAuth } from "../context/AuthContext";
import { MAX_HOUSEHOLDS } from "../constants";
import { getHouseImage } from "../utils/houseImages";
import type { Household } from "../lib/supabaseHousehold";
import homeTogether from "../assets/homeTogether.png";

export default function HouseholdPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    households, activeHousehold, members, loading,
    setActiveHousehold, create, join, leave, kickMember, remove, rename,
  } = useHousehold();

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return <div className="page"><p className="text-light" style={{ textAlign: "center", padding: 40 }}>Lade Haushalte...</p></div>;
  }

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setError("");
    const hh = await create(newName.trim());
    if (!hh) { setError("Maximum erreicht oder Fehler."); return; }
    setShowCreate(false);
    setNewName("");
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setError("");
    const hh = await join(joinCode.trim());
    if (!hh) { setError("Code ungueltig oder Maximum erreicht."); return; }
    setShowJoin(false);
    setJoinCode("");
  };

  const handleRename = async (hh: Household) => {
    if (!editName.trim() || editName.trim() === hh.name) { setEditingId(null); return; }
    await rename(hh.id, editName.trim());
    setEditingId(null);
  };

  const getInviteUrl = (code: string) => {
    const base = window.location.origin + "/catcook";
    return `${base}/join/${code}`;
  };

  return (
    <div className="page household-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Zurueck
      </button>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img src={homeTogether} alt="Haushalte" className="household-hero" />
        <h1 className="page-title">Meine Haushalte</h1>
        <p className="text-light">Teile Wochenplan und Einkaufsliste mit deiner WG oder Familie.</p>
      </div>

      {/* Household List */}
      <div className="household-list">
        {households.map((hh, index) => {
          const isActive = activeHousehold?.id === hh.id;
          const isOwner = hh.created_by === user?.id;
          const isExpanded = expandedId === hh.id;

          return (
            <div key={hh.id} className={`household-card ${isActive ? "household-card--active" : ""}`}>
              <div className="household-card__header">
                <img src={getHouseImage(index)} alt="" className="household-card__house-img" />
                <div className="household-card__info">
                  {editingId === hh.id ? (
                    <div className="household-card__edit-row">
                      <input className="editor-input" value={editName} onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRename(hh)} autoFocus />
                      <button className="icon-btn" onClick={() => handleRename(hh)}><Check size={16} /></button>
                    </div>
                  ) : (
                    <div className="household-card__title-row">
                      <span className="household-card__name">{hh.name}</span>
                      {isActive && <span className="household-card__badge">Aktiv</span>}
                    </div>
                  )}
                  <div className="household-card__quick-actions">
                    {isActive ? (
                      <span className="household-card__active-hint">✓ Aktiver Haushalt</span>
                    ) : (
                      <button className="household-btn household-btn--primary household-btn--small"
                        onClick={() => setActiveHousehold(hh)}>
                        Aktivieren
                      </button>
                    )}
                    <button className="household-btn household-btn--small"
                      onClick={() => setExpandedId(isExpanded ? null : hh.id)}
                      aria-expanded={isExpanded}>
                      <Eye size={14} /> {isExpanded ? "Schließen" : "Anschauen"}
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="household-card__details">
                  {/* Hausverwaltung */}
                  <div className="household-card__section">
                    <h4 className="household-card__section-title">Hausverwaltung</h4>
                    <div className="household-card__actions">
                      {isOwner && editingId !== hh.id && (
                        <button className="household-btn" onClick={() => { setEditingId(hh.id); setEditName(hh.name); }}>
                          <Edit2 size={14} /> Umbenennen
                        </button>
                      )}
                      {isOwner ? (
                        <button className="household-btn household-btn--danger" onClick={() => { if (confirm("Haushalt wirklich loeschen?")) remove(hh.id); }}>
                          <Trash2 size={14} /> Loeschen
                        </button>
                      ) : (
                        <button className="household-btn household-btn--danger" onClick={() => { if (confirm("Haushalt wirklich verlassen?")) leave(hh.id); }}>
                          <LogOut size={14} /> Verlassen
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Link teilen */}
                  <div className="household-card__section">
                    <h4 className="household-card__section-title">Link teilen</h4>
                    <div className="household-card__qr">
                      <p className="text-light" style={{ fontSize: "0.8rem", marginBottom: 8 }}>
                        Einladungscode: <strong>{hh.invite_code}</strong>
                      </p>
                      <QRCodeSVG value={getInviteUrl(hh.invite_code)} size={140} />
                    </div>
                  </div>

                  {/* Mitglieder */}
                  {isActive && members.length > 0 && (
                    <div className="household-card__section">
                      <h4 className="household-card__section-title">
                        <Users size={14} /> Mitglieder
                      </h4>
                      <div className="household-card__member-list">
                        {members.map((m) => {
                          const isSelf = m.user_id === user?.id;
                          const canKick = isOwner && !isSelf && m.role !== "owner";
                          return (
                            <div key={m.user_id} className="household-card__member-row">
                              <span>{m.display_name} {m.role === "owner" ? "👑" : ""}</span>
                              {canKick && (
                                <button className="household-btn household-btn--danger household-btn--small"
                                  onClick={() => { if (confirm(`${m.display_name} rauswerfen?`)) kickMember(hh.id, m.user_id); }}>
                                  <UserMinus size={14} /> Rauswerfen
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {households.length === 0 && (
        <div className="empty-state" style={{ padding: "20px 0" }}>
          <p className="text-light">Noch keine Haushalte. Erstelle einen oder tritt einem bei!</p>
        </div>
      )}

      {/* Action Buttons */}
      {!showCreate && !showJoin && (
        <div className="household-actions">
          {households.length < MAX_HOUSEHOLDS && (
            <button className="household-btn household-btn--primary household-btn--full" onClick={() => { setShowCreate(true); setError(""); }}>
              <Plus size={18} /> Haushalt erstellen
            </button>
          )}
          <button className="household-btn household-btn--full" onClick={() => { setShowJoin(true); setError(""); }}>
            <Users size={18} /> Haushalt beitreten
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="household-form">
          <h3>Neuer Haushalt</h3>
          <input className="editor-input" placeholder="Name (z.B. Unsere WG)" value={newName}
            onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus />
          <div className="household-form__btns">
            <button className="household-btn" onClick={() => setShowCreate(false)}>Abbrechen</button>
            <button className="household-btn household-btn--primary" onClick={handleCreate}>Erstellen</button>
          </div>
        </div>
      )}

      {/* Join Form */}
      {showJoin && (
        <div className="household-form">
          <h3>Haushalt beitreten</h3>
          <input className="editor-input" placeholder="Einladungscode eingeben" value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleJoin()} autoFocus />
          <div className="household-form__btns">
            <button className="household-btn" onClick={() => setShowJoin(false)}>Abbrechen</button>
            <button className="household-btn household-btn--primary" onClick={handleJoin}>Beitreten</button>
          </div>
        </div>
      )}

      {error && <p className="household-error">{error}</p>}
    </div>
  );
}
