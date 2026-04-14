import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHousehold } from "../context/HouseholdContext";
import { useAuth } from "../context/AuthContext";

export default function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { join } = useHousehold();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [hhName, setHhName] = useState("");

  useEffect(() => {
    if (authLoading || !user || !code) return;

    join(code).then((hh) => {
      if (hh) {
        setHhName(hh.name);
        setStatus("success");
      } else {
        setStatus("error");
      }
    });
  }, [code, user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "loading") {
    return (
      <div className="page" style={{ textAlign: "center", padding: 60 }}>
        <p style={{ fontSize: "2rem" }}>🏠</p>
        <p>Trete Haushalt bei...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page" style={{ textAlign: "center", padding: 60 }}>
        <p style={{ fontSize: "2rem" }}>😿</p>
        <h2>Beitritt fehlgeschlagen</h2>
        <p className="text-light">Der Einladungscode ist ungueltig oder du hast bereits 4 Haushalte.</p>
        <button className="household-btn household-btn--primary" onClick={() => navigate("/")} style={{ marginTop: 16 }}>
          Zur Startseite
        </button>
      </div>
    );
  }

  return (
    <div className="page" style={{ textAlign: "center", padding: 60 }}>
      <p style={{ fontSize: "2rem" }}>🎉</p>
      <h2>Willkommen bei "{hhName}"!</h2>
      <p className="text-light">Du bist dem Haushalt erfolgreich beigetreten.</p>
      <button className="household-btn household-btn--primary" onClick={() => navigate("/household")} style={{ marginTop: 16 }}>
        Zu meinen Haushalten
      </button>
    </div>
  );
}
