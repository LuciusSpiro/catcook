import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import { SKILLS, ACHIEVEMENTS, RANKS, getRank, getNextRank } from "../types/player";
import type { AchievementTier } from "../types/player";

const TIER_LABELS: Record<AchievementTier, string> = {
  locked: "",
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
};

const TIER_COLORS: Record<AchievementTier, string> = {
  locked: "#ccc",
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#ffd700",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { player, stats, getAchievementTier, skillXp } = usePlayer();
  const [showRanks, setShowRanks] = useState(false);

  if (!player) return null;

  const totalXp = player.xp ?? 0;
  const currentRank = getRank(totalXp);
  const nextRank = getNextRank(totalXp);
  const xpInRank = totalXp - currentRank.xpRequired;
  const xpForNext = nextRank ? nextRank.xpRequired - currentRank.xpRequired : 1;
  const rankProgress = nextRank ? Math.min(1, xpInRank / xpForNext) : 1;

  if (showRanks) {
    return (
      <div className="page profile-page">
        <button className="back-btn" onClick={() => setShowRanks(false)}>
          <ArrowLeft size={20} />
          Zurück
        </button>
        <h1 className="page-title">🏅 Mi-Ausbildungssystem</h1>
        <p className="text-light" style={{ marginBottom: 16 }}>
          Koche Rezepte um EP zu sammeln und aufzusteigen!
        </p>
        <div className="rank-list">
          {RANKS.map((rank) => {
            const isCurrent = rank.rank === currentRank.rank;
            const isUnlocked = totalXp >= rank.xpRequired;
            return (
              <div
                key={rank.rank}
                className={`rank-list-item ${isCurrent ? "rank-list-item--current" : ""} ${isUnlocked ? "rank-list-item--unlocked" : "rank-list-item--locked"}`}
              >
                <div className="rank-list-item__number">{rank.rank}</div>
                <div className="rank-list-item__emoji">{rank.emoji}</div>
                <div className="rank-list-item__info">
                  <span className="rank-list-item__name">{rank.name}</span>
                  <span className="rank-list-item__xp">{rank.xpRequired} EP</span>
                </div>
                {isCurrent && <span className="rank-list-item__badge">DU</span>}
                {isUnlocked && !isCurrent && <span className="rank-list-item__check">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Zurück
      </button>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header__cat">
          <svg viewBox="0 0 120 120" width="100" height="100">
            <ellipse cx="60" cy="18" rx="22" ry="14" fill="white" stroke="#e0e0e0" strokeWidth="1.5" />
            <ellipse cx="50" cy="12" rx="6" ry="8" fill="white" />
            <ellipse cx="60" cy="9" rx="6" ry="9" fill="white" />
            <ellipse cx="70" cy="12" rx="6" ry="8" fill="white" />
            <rect x="40" y="18" width="40" height="12" rx="2" fill="white" stroke="#e0e0e0" strokeWidth="1.5" />
            <circle cx="60" cy="65" r="30" fill="#ff6b6b" />
            <polygon points="34,45 26,18 48,38" fill="#ff6b6b" />
            <polygon points="86,45 94,18 72,38" fill="#ff6b6b" />
            <polygon points="36,43 30,22 46,38" fill="#ffb3b3" />
            <polygon points="84,43 90,22 74,38" fill="#ffb3b3" />
            <ellipse cx="48" cy="60" rx="5" ry="5.5" fill="white" />
            <ellipse cx="72" cy="60" rx="5" ry="5.5" fill="white" />
            <circle cx="49" cy="61" r="3" fill="#2d2d2d" />
            <circle cx="73" cy="61" r="3" fill="#2d2d2d" />
            <circle cx="50" cy="59.5" r="1" fill="white" />
            <circle cx="74" cy="59.5" r="1" fill="white" />
            <ellipse cx="60" cy="70" rx="3" ry="2" fill="#e05555" />
            <path d="M54,74 Q60,80 66,74" fill="none" stroke="#e05555" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="40" cy="72" r="5" fill="#ffb3b3" opacity="0.5" />
            <circle cx="80" cy="72" r="5" fill="#ffb3b3" opacity="0.5" />
          </svg>
        </div>
        <h1 className="profile-header__name">{player.name}</h1>
        <button className="profile-header__rank" onClick={() => setShowRanks(true)}>
          <span className="profile-header__rank-emoji">{currentRank.emoji}</span>
          <span className="profile-header__rank-name">{currentRank.name}</span>
          <span className="profile-header__rank-arrow">›</span>
        </button>
      </div>

      {/* Rank Progress */}
      <div className="profile-rank-card">
        <div className="rank-bar__header">
          <span className="rank-bar__label">Rang {currentRank.rank}</span>
          <span className="rank-bar__xp">{totalXp} EP</span>
        </div>
        <div className="rank-bar rank-bar--large">
          <div className="rank-bar__fill" style={{ width: `${rankProgress * 100}%` }} />
        </div>
        {nextRank && (
          <div className="rank-bar__next">
            Nächster: {nextRank.emoji} {nextRank.name} ({nextRank.xpRequired} EP)
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="profile-section">
        <h2 className="profile-section__title">🔪 Skills</h2>
        <div className="skills-list">
          {SKILLS.map((skill) => {
            const xp = skillXp[skill.id] ?? 0;
            const level = Math.min(10, Math.floor(xp / 3) + 1);
            const progressInLevel = xp % 3;
            return (
              <div key={skill.id} className="skill-item">
                <span className="skill-item__emoji">{skill.emoji}</span>
                <div className="skill-item__info">
                  <div className="skill-item__header">
                    <span className="skill-item__name">{skill.name}</span>
                    <span className="skill-item__level">Lv. {level}</span>
                  </div>
                  <div className="skill-item__bar">
                    <div
                      className="skill-item__fill"
                      style={{ width: `${(progressInLevel / 3) * 100}%` }}
                    />
                  </div>
                  <span className="skill-item__desc">{skill.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="profile-section">
        <h2 className="profile-section__title">🏆 Achievements</h2>
        <div className="achievements-list">
          {ACHIEVEMENTS.map((ach) => {
            const tier = getAchievementTier(ach.statKey, ach.thresholds);
            const val = stats[ach.statKey] ?? 0;
            const nextThreshold =
              tier === "gold"
                ? ach.thresholds[2]
                : tier === "silver"
                ? ach.thresholds[2]
                : tier === "bronze"
                ? ach.thresholds[1]
                : ach.thresholds[0];
            const progress = Math.min(1, val / nextThreshold);

            return (
              <div
                key={ach.id}
                className={`achievement-item achievement-item--${tier}`}
              >
                <div
                  className="achievement-item__icon"
                  style={{ borderColor: TIER_COLORS[tier] }}
                >
                  <span>{ach.emoji}</span>
                  {tier !== "locked" && (
                    <span className="achievement-item__medal">
                      {TIER_LABELS[tier]}
                    </span>
                  )}
                </div>
                <div className="achievement-item__info">
                  <span className="achievement-item__name">{ach.name}</span>
                  <span className="achievement-item__desc">
                    {ach.description} ({val}/{nextThreshold})
                  </span>
                  <div className="achievement-item__bar">
                    <div
                      className="achievement-item__fill"
                      style={{
                        width: `${progress * 100}%`,
                        background: TIER_COLORS[tier === "locked" ? "bronze" : tier],
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
