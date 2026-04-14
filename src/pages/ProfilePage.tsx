import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import { useHousehold } from "../context/HouseholdContext";
import kittenKitchenImg from "../assets/kittenkitchen.png";
import avatarImg from "../assets/avatar.png";
import { SKILLS, ACHIEVEMENTS, RANKS, getRank, getNextRank } from "../types/player";
import { SKILL_MAX_LEVEL, SKILL_COOKS_PER_LEVEL } from "../constants";
import type { AchievementTier, SkillId } from "../types/player";
import skillChopping from "../assets/skill-chopping.png";
import skillCooking from "../assets/skill-cooking.png";
import skillFrying from "../assets/skill-frying.png";
import skillBaking from "../assets/skill-baking.png";
import skillSeasoning from "../assets/skill-seasoning.png";
import skillTiming from "../assets/skill-timing.png";
import achCollector from "../assets/ach-collector.png";
import achChef from "../assets/ach-chef.png";
import achChopper from "../assets/ach-chopper.png";
import achCook from "../assets/ach-cook.png";
import achFryer from "../assets/ach-fryer.png";
import achBaker from "../assets/ach-baker.png";
import achSeasoner from "../assets/ach-seasoner.png";
import achTimer from "../assets/ach-timer.png";
import achGourmet from "../assets/ach-gourmet.png";
import achToolmaster from "../assets/ach-toolmaster.png";

const SKILL_IMAGES: Record<SkillId, string> = {
  chopping: skillChopping,
  cooking: skillCooking,
  frying: skillFrying,
  baking: skillBaking,
  seasoning: skillSeasoning,
  timing: skillTiming,
};

const ACH_IMAGES: Record<string, string> = {
  collector: achCollector,
  chef: achChef,
  chopper: achChopper,
  cook: achCook,
  fryer: achFryer,
  baker: achBaker,
  seasoner: achSeasoner,
  timer: achTimer,
  gourmet: achGourmet,
  toolmaster: achToolmaster,
};

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
  const { activeHousehold, households } = useHousehold();
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
        <h1 className="page-title">🏅 Miausbildungssystem</h1>
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
        <img className="profile-header__cat" src={avatarImg} alt="Chef Cat" width="140" />
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
        <div className="card-grid">
          {SKILLS.map((skill) => {
            const count = skillXp[skill.id] ?? 0;
            const level = Math.min(SKILL_MAX_LEVEL, Math.floor(count / SKILL_COOKS_PER_LEVEL));
            const progressInLevel = level >= SKILL_MAX_LEVEL ? SKILL_COOKS_PER_LEVEL : count % SKILL_COOKS_PER_LEVEL;
            return (
              <div key={skill.id} className="stat-card">
                <img className="stat-card__img" src={SKILL_IMAGES[skill.id]} alt={skill.name} />
                <div className="stat-card__title">{skill.name}</div>
                <div className="stat-card__level">Lv. {level}</div>
                <div className="stat-card__bar">
                  <div
                    className="stat-card__fill"
                    style={{ width: `${(progressInLevel / SKILL_COOKS_PER_LEVEL) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Household */}
      <div className="profile-section">
        <h2 className="profile-section__title">🏠 Haushalt</h2>
        <NavLink to="/household" className="household-card">
          <img
            className="household-card__img"
            src={kittenKitchenImg}
            alt={activeHousehold?.name ?? "Haushalte"}
          />
          <div className="household-card__info">
            <div className="household-card__name">
              {activeHousehold?.name ?? "Haushalt anlegen"}
            </div>
            <div className="household-card__sub">
              {households.length > 0
                ? `${households.length} Haushalt${households.length === 1 ? "" : "e"}`
                : "Noch kein Haushalt"}
            </div>
          </div>
        </NavLink>
      </div>

      {/* Achievements */}
      <div className="profile-section">
        <h2 className="profile-section__title">🏆 Achievements</h2>
        <div className="card-grid">
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
            const tierColor = TIER_COLORS[tier === "locked" ? "bronze" : tier];

            return (
              <div
                key={ach.id}
                className={`stat-card stat-card--${tier}`}
                style={{ borderColor: tier !== "locked" ? TIER_COLORS[tier] : undefined }}
              >
                <div className="stat-card__img-wrap">
                  <img className="stat-card__img" src={ACH_IMAGES[ach.id] ?? ""} alt={ach.name} />
                  {tier !== "locked" && (
                    <span className="stat-card__medal">{TIER_LABELS[tier]}</span>
                  )}
                </div>
                <div className="stat-card__title">{ach.name}</div>
                <div className="stat-card__sub">{val}/{nextThreshold}</div>
                <div className="stat-card__bar">
                  <div
                    className="stat-card__fill"
                    style={{
                      width: `${progress * 100}%`,
                      background: tierColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
