import { prisma } from "./database/prisma";

export type PlanTier = 'basic' | 'professional' | 'enterprise';

interface PlanConfig {
  maxRoutes: number;
  maxPois: number;
  features: string[];
}

const PLAN_LIMITS: Record<PlanTier, PlanConfig> = {
  basic: {
    maxRoutes: 3,
    maxPois: 20,
    features: ['basic_analytics'],
  },
  professional: {
    maxRoutes: 15,
    maxPois: 100,
    features: ['basic_analytics', 'image_gallery', 'route_builder'],
  },
  enterprise: {
    maxRoutes: 100,
    maxPois: 1000,
    features: ['basic_analytics', 'image_gallery', 'route_builder', 'advanced_reports', 'api_access'],
  },
};

export async function checkPlanLimits(municipalityId: string) {
  const municipality = await prisma.municipality.findUnique({
    where: { id: municipalityId },
    select: {
      planTier: true,
      _count: {
        select: {
          routes: true,
        },
      },
    },
  });

  if (!municipality) {
    throw new Error('Municipality not found');
  }

  const tier = (municipality.planTier as PlanTier) || 'basic';
  const config = PLAN_LIMITS[tier];
  
  const currentRoutes = municipality._count.routes;

  return {
    isWithinRouteLimit: currentRoutes < config.maxRoutes,
    currentRoutes,
    maxRoutes: config.maxRoutes,
    tier,
    config
  };
}
