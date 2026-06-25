import { PlanMember } from '@/services/plan';

/**
 * Orders plan members with the organizer (plan creator) first, preserving the
 * relative order of the remaining members. Centralizes member ordering so
 * screens and components don't duplicate the logic.
 *
 * Relies on Array.prototype.sort being stable (guaranteed by Hermes/V8).
 */
export function orderPlanMembers(members: PlanMember[], organizerId: number): PlanMember[] {
    return [...members].sort((a, b) => {
        if (a.id === organizerId) return -1;
        if (b.id === organizerId) return 1;
        return 0;
    });
}
