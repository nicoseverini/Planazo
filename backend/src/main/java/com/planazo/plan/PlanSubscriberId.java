package com.planazo.plan;

import java.io.Serializable;
import java.util.Objects;

public class PlanSubscriberId implements Serializable {

    private Long planId;
    private Long userId;

    public PlanSubscriberId() {
    }

    public PlanSubscriberId(Long planId, Long userId) {
        this.planId = planId;
        this.userId = userId;
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlanSubscriberId that = (PlanSubscriberId) o;
        return Objects.equals(planId, that.planId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(planId, userId);
    }
}