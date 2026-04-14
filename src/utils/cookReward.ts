import type { CustomRecipe } from "../types/player";
import { SKILLS, getRank, XP_RECIPE_COMPLETE_BASE, XP_PER_STEP, XP_SKILL_LEVELUP } from "../types/player";
import { SKILL_MAX_LEVEL, SKILL_XP_PER_LEVEL } from "../constants";

export interface CookReward {
  baseXp: number;
  stepXp: number;
  skillLevelUps: { skillName: string; emoji: string; newLevel: number }[];
  skillBonusXp: number;
  totalXp: number;
  oldRank: number;
  newRank: number;
}

function getSkillLevel(xp: number): number {
  return Math.min(SKILL_MAX_LEVEL, Math.floor(xp / SKILL_XP_PER_LEVEL) + 1);
}

export function calculateCookReward(
  currentXp: number,
  allRecipes: CustomRecipe[],
  recipe: CustomRecipe
): CookReward {
  const oldRank = getRank(currentXp).rank;
  const baseXp = XP_RECIPE_COMPLETE_BASE;
  const stepXp = recipe.steps.length * XP_PER_STEP;

  // Count current skill usage across all existing recipes
  const skillCounts: Record<string, number> = {};
  for (const r of allRecipes) {
    for (const step of r.steps) {
      if (step.skillId) {
        skillCounts[step.skillId] = (skillCounts[step.skillId] ?? 0) + 1;
      }
    }
  }

  // Count skills in this recipe
  const recipeSkillCounts: Record<string, number> = {};
  for (const step of recipe.steps) {
    if (step.skillId) {
      recipeSkillCounts[step.skillId] = (recipeSkillCounts[step.skillId] ?? 0) + 1;
    }
  }

  // Detect level-ups
  const skillLevelUps: CookReward["skillLevelUps"] = [];
  for (const [skillId, addedCount] of Object.entries(recipeSkillCounts)) {
    const before = skillCounts[skillId] ?? 0;
    const after = before + addedCount;
    const levelBefore = getSkillLevel(before);
    const levelAfter = getSkillLevel(after);
    if (levelAfter > levelBefore) {
      const skillDef = SKILLS.find((s) => s.id === skillId);
      if (skillDef) {
        for (let lv = levelBefore + 1; lv <= levelAfter; lv++) {
          skillLevelUps.push({ skillName: skillDef.name, emoji: skillDef.emoji, newLevel: lv });
        }
      }
    }
  }

  const skillBonusXp = skillLevelUps.length * XP_SKILL_LEVELUP;
  const totalXp = baseXp + stepXp + skillBonusXp;
  const newRank = getRank(currentXp + totalXp).rank;

  return { baseXp, stepXp, skillLevelUps, skillBonusXp, totalXp, oldRank, newRank };
}
