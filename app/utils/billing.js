export const PLANS = {
  FREE: "FREE",
  STARTER: "STARTER",
  GROWTH: "GROWTH",
  PREMIUM: "PREMIUM",
};

export const PLAN_PRICES = {
  [PLANS.FREE]: 0,
  [PLANS.STARTER]: 50,
  [PLANS.GROWTH]: 70,
  [PLANS.PREMIUM]: 100,
};

export const DESIGN_TIERS = {
  FREE: ["FREE"],
  STARTER: ["FREE", "GRADIENT", "SLIDING"],
  GROWTH: ["FREE", "GRADIENT", "SLIDING", "GLASSMORPHISM", "CAROUSEL"],
  PREMIUM: ["FREE", "GRADIENT", "SLIDING", "GLASSMORPHISM", "CAROUSEL", "LUXURY", "INTERACTIVE", "DYNAMIC"],
};

export function isDesignUnlocked(plan, designType) {
  const unlockedDesigns = DESIGN_TIERS[plan] || DESIGN_TIERS.FREE;
  return unlockedDesigns.includes(designType);
}

export function getRequiredPlanForDesign(designType) {
  if (DESIGN_TIERS.FREE.includes(designType)) return PLANS.FREE;
  if (DESIGN_TIERS.STARTER.includes(designType)) return PLANS.STARTER;
  if (DESIGN_TIERS.GROWTH.includes(designType)) return PLANS.GROWTH;
  return PLANS.PREMIUM;
}
