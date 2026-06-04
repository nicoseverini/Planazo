package com.planazo.plan;

import com.planazo.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "plan_subscribers")
public class PlanSubscriber {

    @EmbeddedId
    private PlanSubscriberId id = new PlanSubscriberId();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("planId")
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column
    private Boolean accepted;

    public PlanSubscriber() {
    }

    public PlanSubscriber(Plan plan, User user, Boolean accepted) {
        this.plan = plan;
        this.user = user;
        this.accepted = accepted;
        this.id = new PlanSubscriberId(plan.getId(), user.getId());
    }

    public PlanSubscriberId getId() {
        return id;
    }

    public void setId(PlanSubscriberId id) {
        this.id = id;
    }

    public Plan getPlan() {
        return plan;
    }

    public void setPlan(Plan plan) {
        this.plan = plan;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Boolean getAccepted() {
        return accepted;
    }

    public void setAccepted(Boolean accepted) {
        this.accepted = accepted;
    }

    public boolean matchesUserId(Long userId) {
        return user != null && user.getId() != null && user.getId().equals(userId);
    }

    public boolean countsAsSubscriber() {
        return accepted == null || Boolean.TRUE.equals(accepted);
    }
}