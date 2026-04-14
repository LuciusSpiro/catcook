import type { CustomRecipe, SkillId } from "../types/player";
import { SKILLS, getRank, XP_RECIPE_COMPLETE_BASE, XP_PER_STEP, XP_SKILL_LEVELUP } from "../types/player";
import { SKILL_MAX_LEVEL, SKILL_COOKS_PER_LEVEL } from "../constants";

export interface CookReward {
  baseXp: number;
  stepXp: number;
  skillLevelUps: { skillId: SkillId; skillName: string; emoji: string; newLevel: number }[];
  skillBonusXp: number;
  totalXp: number;
  oldRank: number;
  newRank: number;
  newSkillCounts: Partial<Record<SkillId, number>>;
}

export function getSkillLevel(count: number): number {
  return Math.min(SKILL_MAX_LEVEL, Math.floor(count / SKILL_COOKS_PER_LEVEL));
}

function uniqueSkillsInRecipe(recipe: CustomRecipe): SkillId[] {
  const set = new Set<SkillId>();
  for (const step of recipe.steps) {
    if (step.skillId) set.add(step.skillId);
  }
  return Array.from(set);
}

export function calculateCookReward(
  currentXp: number,
  currentSkillCounts: Partial<Record<SkillId, number>>,
  recipe: CustomRecipe,
  goodTiming = false,
): CookReward {
  const oldRank = getRank(currentXp).rank;
  const baseXp = XP_RECIPE_COMPLETE_BASE;
  const stepXp = recipe.steps.length * XP_PER_STEP;

  const skills: SkillId[] = uniqueSkillsInRecipe(recipe).filter((s) => s !== "timing");
  if (goodTiming) skills.push("timing");
  const newSkillCounts: Partial<Record<SkillId, number>> = { ...currentSkillCounts };
  const skillLevelUps: CookReward["skillLevelUps"] = [];

  for (const skillId of skills) {
    const before = currentSkillCounts[skillId] ?? 0;
    const after = before + 1;
    newSkillCounts[skillId] = after;
    const levelBefore = getSkillLevel(before);
    const levelAfter = getSkillLevel(after);
    if (levelAfter > levelBefore) {
      const skillDef = SKILLS.find((s) => s.id === skillId);
      if (skillDef) {
        skillLevelUps.push({ skillId, skillName: skillDef.name, emoji: skillDef.emoji, newLevel: levelAfter });
      }
    }
  }

  const skillBonusXp = skillLevelUps.length * XP_SKILL_LEVELUP;
  const totalXp = baseXp + stepXp + skillBonusXp;
  const newRank = getRank(currentXp + totalXp).rank;

  return { baseXp, stepXp, skillLevelUps, skillBonusXp, totalXp, oldRank, newRank, newSkillCounts };
}
