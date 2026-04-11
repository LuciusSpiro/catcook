import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Play, Pause, SkipForward, ChevronRight, Clock } from "lucide-react";
import { SKILLS, INGREDIENT_UNITS, getRank, getNextRank, XP_SKILL_LEVELUP } from "../types/player";
import type { CustomRecipe } from "../types/player";
import { usePlayer, type CookReward } from "../context/PlayerContext";
import chefPresenting from "../assets/chef-presenting.png";

interface CookingSessionProps {
  recipe: CustomRecipe;
  onExit: () => void;
}

export default function CookingSession({ recipe, onExit }: CookingSessionProps) {
  const { completeRecipeCook, player } = usePlayer();
  const [activeStep, setActiveStep] = useState(0);
  const [reward, setReward] = useState<CookReward | null>(null);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInitialized, setTimerInitialized] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const currentStep = recipe.steps[activeStep];
  const hasTimer = !!currentStep?.waitMinutes && currentStep.waitMinutes > 0;
  const totalSteps = recipe.steps.length;

  // Reset timer when step changes
  useEffect(() => {
    setTimerRunning(false);
    setTimerInitialized(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (currentStep?.waitMinutes) {
      setTimerSeconds(currentStep.waitMinutes * 60);
    } else {
      setTimerSeconds(0);
    }
  }, [activeStep, currentStep?.waitMinutes]);

  // Timer countdown
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timerSeconds]);

  // Auto-advance when timer reaches 0
  useEffect(() => {
    if (timerInitialized && timerSeconds === 0 && hasTimer && !timerRunning) {
      const timeout = setTimeout(() => goNext(), 800);
      return () => clearTimeout(timeout);
    }
  }, [timerSeconds, timerInitialized, hasTimer, timerRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishCooking = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    const r = completeRecipeCook(recipe);
    setReward(r);
  }, [completeRecipeCook, recipe]);

  const goNext = useCallback(() => {
    if (activeStep < totalSteps - 1) {
      setActiveStep(activeStep + 1);
    } else {
      finishCooking();
    }
  }, [activeStep, totalSteps, finishCooking]);

  const toggleTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      setTimerRunning(true);
      setTimerInitialized(true);
    }
  };

  const skipTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
    goNext();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ── Finished screen with XP rewards ──
  if (reward) {
    const rankedUp = reward.newRank > reward.oldRank;
    const newRankDef = getRank((player?.xp ?? 0));
    const nextRankDef = getNextRank((player?.xp ?? 0));
    const totalXp = player?.xp ?? 0;
    const xpInRank = totalXp - newRankDef.xpRequired;
    const xpForNext = nextRankDef ? nextRankDef.xpRequired - newRankDef.xpRequired : 1;
    const rankProgress = nextRankDef ? Math.min(1, xpInRank / xpForNext) : 1;

    return (
      <div className="page cook-page">
        <div className="cook-success">
          <img className="cook-success__cat-img" src={chefPresenting} alt="Chef Cat" width="140" />
          <h1 className="cook-success__title">Purr-fekt!</h1>
          <p className="cook-success__subtitle">
            {recipe.name} ist fertig!
          </p>

          {/* XP Breakdown */}
          <div className="xp-reward">
            <div className="xp-reward__header">EP verdient</div>
            <div className="xp-reward__row">
              <span>Rezept abgeschlossen</span>
              <span className="xp-reward__val">+{reward.baseXp} EP</span>
            </div>
            <div className="xp-reward__row">
              <span>{recipe.steps.length} Schritte</span>
              <span className="xp-reward__val">+{reward.stepXp} EP</span>
            </div>
            {reward.skillLevelUps.map((lu, i) => (
              <div key={i} className="xp-reward__row xp-reward__row--bonus">
                <span>{lu.emoji} {lu.skillName} → Lv. {lu.newLevel}</span>
                <span className="xp-reward__val">+{XP_SKILL_LEVELUP} EP</span>
              </div>
            ))}
            <div className="xp-reward__total">
              <span>Gesamt</span>
              <span className="xp-reward__val xp-reward__val--total">+{reward.totalXp} EP</span>
            </div>
          </div>

          {/* Rank Up */}
          {rankedUp && (
            <div className="rank-up-banner">
              <div className="rank-up-banner__emoji">{newRankDef.emoji}</div>
              <div className="rank-up-banner__text">
                <span className="rank-up-banner__label">Rang aufgestiegen!</span>
                <span className="rank-up-banner__name">{newRankDef.name}</span>
              </div>
            </div>
          )}

          {/* Current rank progress */}
          <div className="rank-progress-card">
            <div className="rank-progress-card__header">
              <span>{newRankDef.emoji} {newRankDef.name}</span>
              <span className="rank-progress-card__xp">{totalXp} EP</span>
            </div>
            <div className="rank-progress-card__bar">
              <div
                className="rank-progress-card__fill"
                style={{ width: `${rankProgress * 100}%` }}
              />
            </div>
            {nextRankDef && (
              <div className="rank-progress-card__next">
                Nächster Rang: {nextRankDef.emoji} {nextRankDef.name} ({nextRankDef.xpRequired} EP)
              </div>
            )}
          </div>

          <p className="cook-success__text">Guten Appetit! 🐾</p>
          <button className="cook-success__btn" onClick={onExit}>
            Zurück zur Auswahl
          </button>
        </div>
      </div>
    );
  }

  const skill = currentStep?.skillId
    ? SKILLS.find((s) => s.id === currentStep.skillId)
    : null;

  const progress = ((activeStep + 1) / totalSteps) * 100;

  return (
    <div className="page cook-page cooking-session">
      {/* Header */}
      <div className="cook-header">
        <button className="back-btn" onClick={onExit}>
          <ArrowLeft size={20} />
          Abbrechen
        </button>
        <div className="cook-progress-bar">
          <div
            className="cook-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="cook-progress-text">
          {activeStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Active Step */}
      <div className="cook-active-step">
        <div className="cook-active-step__badge">
          Schritt {activeStep + 1}
          {skill && (
            <span className="cook-active-step__skill">
              {skill.emoji} {skill.name}
            </span>
          )}
        </div>
        <p className="cook-active-step__text">{currentStep.description}</p>

        {/* Timer */}
        {hasTimer && (
          <div className={`cook-timer ${timerSeconds === 0 && timerInitialized ? "cook-timer--done" : ""}`}>
            <div className="cook-timer__display">
              <Clock size={20} />
              <span className="cook-timer__time">{formatTime(timerSeconds)}</span>
            </div>
            <div className="cook-timer__actions">
              <button
                className="cook-timer__btn cook-timer__btn--play"
                onClick={toggleTimer}
              >
                {timerRunning ? <Pause size={20} /> : <Play size={20} />}
                {timerRunning ? "Pause" : timerInitialized ? "Weiter" : "Starten"}
              </button>
              <button
                className="cook-timer__btn cook-timer__btn--skip"
                onClick={skipTimer}
              >
                <SkipForward size={18} />
                Überspringen
              </button>
            </div>
            {timerSeconds === 0 && timerInitialized && (
              <div className="cook-timer__done-text">
                ⏱️ Zeit abgelaufen! Weiter zum nächsten Schritt...
              </div>
            )}
          </div>
        )}

        {/* Next button (no timer) */}
        {!hasTimer && (
          <button className="cook-next-btn" onClick={goNext}>
            {activeStep < totalSteps - 1 ? (
              <>Nächster Schritt <ChevronRight size={20} /></>
            ) : (
              <>Fertig! 🎉</>
            )}
          </button>
        )}
      </div>

      {/* Ingredients */}
      <div className="cook-section">
        <h3 className="cook-section__title">🥕 Zutaten</h3>
        <div className="cook-ingredients">
          {recipe.ingredients.map((ing, i) => {
            const unitLabel = INGREDIENT_UNITS.find((u) => u.value === ing.unit)?.label ?? ing.unit;
            const measure = ing.amount != null ? `${ing.amount} ${unitLabel}` : "";
            return (
              <div key={i} className="cook-ingredient">
                <span className="cook-ingredient__icon">{ing.icon}</span>
                <span className="cook-ingredient__name">{ing.name}</span>
                <span className="cook-ingredient__amount">{measure}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Steps */}
      <div className="cook-section">
        <h3 className="cook-section__title">📝 Alle Schritte</h3>
        <div className="cook-steps-list">
          {recipe.steps.map((step, i) => {
            const stepSkill = step.skillId
              ? SKILLS.find((s) => s.id === step.skillId)
              : null;
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            return (
              <div
                key={i}
                className={`cook-step-item ${isActive ? "cook-step-item--active" : ""} ${isDone ? "cook-step-item--done" : ""}`}
              >
                <div className={`cook-step-item__number ${isDone ? "cook-step-item__number--done" : ""}`}>
                  {isDone ? "✓" : i + 1}
                </div>
                <div className="cook-step-item__content">
                  <p className="cook-step-item__text">{step.description}</p>
                  <div className="cook-step-item__meta">
                    {stepSkill && (
                      <span className="step-card__skill">
                        {stepSkill.emoji} {stepSkill.name}
                      </span>
                    )}
                    {step.waitMinutes && step.waitMinutes > 0 && (
                      <span className="step-card__time">
                        ⏱️ {step.waitMinutes} Min.
                      </span>
                    )}
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
