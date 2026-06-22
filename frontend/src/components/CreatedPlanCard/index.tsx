import { PlanCard } from '@/components/PlanCard';
import { PlanSummary } from '@/services/plan';

export type CreatedPlanCardProps = {
    plan: PlanSummary;
    onPress: (planId: number) => void;
};

export function CreatedPlanCard({ plan, onPress }: CreatedPlanCardProps) {
    return <PlanCard plan={plan} onPress={onPress} variant="created" />;
}
