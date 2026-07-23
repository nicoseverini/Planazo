package com.planazo.plan;

import com.planazo.common.constants.Interest;
import com.planazo.common.exception.AgeRestrictionException;
import com.planazo.user.User;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Entity(name = "plans")
public class Plan {
    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time", nullable = false)
    private LocalDateTime endDateTime;

    // Computed: minutes between startDateTime and endDateTime
    @Column
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanVisibility visibility;

    @Column
    private Integer maxSubscribers;

    @Column
    private Integer minAge;

    @Column
    private Integer maxAge;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "plan_interests", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "interest", nullable = false)
    @Enumerated(EnumType.STRING)
    private List<Interest> interests = new ArrayList<>();

    @Column
    private String country;

    @Column
    private String state;

    @Column
    private String city;

    @Column(name = "address_line")
    private String address;

    // Derived from country/city/address; kept for backward compat and search
    @Column
    private String location;

    private Double latitude;

    private Double longitude;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "plan_images", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanSubscriber> subscribers = new ArrayList<>();

    @Column(name = "subscriber_count", nullable = false, columnDefinition = "integer default 0")
    private int subscriberCount = 0;

    @Column(name = "budget", nullable = false, columnDefinition = "double precision default 0 check (budget >= 0 and budget <= 9999999)")
    private Double budget = 0.0;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = true)
    private String timezone;

    public Plan() {}

    public Plan(String title, String description, LocalDateTime startDateTime, LocalDateTime endDateTime,
                PlanVisibility visibility, Integer maxSubscribers, Integer minAge, Integer maxAge,
                List<Interest> interests, String country, String state, String city, String address,
                Double latitude, Double longitude, List<String> images, User creator, String timezone) {
        this.title = title;
        this.description = description;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.durationMinutes = computeDuration(startDateTime, endDateTime);
        this.visibility = visibility;
        this.maxSubscribers = maxSubscribers;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.interests = interests == null ? new ArrayList<>() : new ArrayList<>(interests);
        setLocationParts(country, state, city, address);
        this.latitude = latitude;
        this.longitude = longitude;
        this.images = images == null ? new ArrayList<>() : new ArrayList<>(images);
        this.creator = creator;
        this.active = true;
        this.subscriberCount = 0;
        this.timezone = timezone;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
        this.durationMinutes = computeDuration(this.startDateTime, this.endDateTime);
    }
    public LocalDateTime getEndDateTime() { return endDateTime; }
    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
        this.durationMinutes = computeDuration(this.startDateTime, this.endDateTime);
    }
    public Integer getDurationMinutes() { return durationMinutes; }
    public PlanVisibility getVisibility() { return visibility; }
    public void setVisibility(PlanVisibility visibility) { this.visibility = visibility; }
    public Integer getMaxSubscribers() { return maxSubscribers; }
    public void setMaxSubscribers(Integer maxSubscribers) { this.maxSubscribers = maxSubscribers; }
    public Integer getMinAge() { return minAge; }
    public void setMinAge(Integer minAge) { this.minAge = minAge; }
    public Integer getMaxAge() { return maxAge; }
    public void setMaxAge(Integer maxAge) { this.maxAge = maxAge; }
    public List<Interest> getInterests() { return interests; }
    public void setInterests(List<Interest> interests) {
        this.interests = interests == null ? new ArrayList<>() : new ArrayList<>(interests);
    }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public void setLocationParts(String country, String state, String city, String address) {
        this.country = country != null ? country.trim() : null;
        this.state = state != null ? state.trim() : null;
        this.city = city != null ? city.trim() : null;
        this.address = address != null ? address.trim() : null;
        StringBuilder derived = new StringBuilder();
        if (this.address != null && !this.address.isBlank()) derived.append(this.address);
        if (this.city != null && !this.city.isBlank()) {
            if (derived.length() > 0) derived.append(", ");
            derived.append(this.city);
        }
        if (this.state != null && !this.state.isBlank()) {
            if (derived.length() > 0) derived.append(", ");
            derived.append(this.state);
        }
        if (this.country != null && !this.country.isBlank()) {
            if (derived.length() > 0) derived.append(", ");
            derived.append(this.country);
        }
        this.location = derived.toString();
    }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images == null ? new ArrayList<>() : new ArrayList<>(images); }
    public User getCreator() { return creator; }
    public List<PlanSubscriber> getSubscribers() { return subscribers; }
    public void setSubscribers(List<PlanSubscriber> subscribers) {
        this.subscribers = subscribers == null ? new ArrayList<>() : subscribers;
    }
    public int getSubscriberCount() { return subscriberCount; }
    public void incrementSubscriberCount() { this.subscriberCount++; }
    public void decrementSubscriberCount() { this.subscriberCount = Math.max(0, this.subscriberCount - 1); }
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    public boolean isActive() {
        return active && LocalDateTime.now(ZoneOffset.UTC).isBefore(endDateTime);
    }
    public void setActive(Boolean active) { this.active = active; }
    public String getTimezone() { return timezone != null ? timezone : "UTC"; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public boolean hasSubscriber(Long userId) {
        return subscribers.stream().anyMatch(subscription -> subscription.matchesUserId(userId));
    }

    public boolean addSubscriber(User user, Boolean accepted) {
        if (user == null || user.getId() == null || hasSubscriber(user.getId())) return false;
        subscribers.add(new PlanSubscriber(this, user, accepted));
        return true;
    }

    public boolean removeSubscriber(Long userId) {
        return subscribers.removeIf(subscription -> subscription.matchesUserId(userId));
    }

    public boolean isFull() {
        return maxSubscribers != null && subscriberCount >= maxSubscribers;
    }

    public void checkAgeEligibility(User user) {
        if (minAge == null && maxAge == null) return;
        int age = Period.between(user.getBirthDate(), LocalDate.now(ZoneOffset.UTC)).getYears();
        if (minAge != null && age < minAge) throw new AgeRestrictionException();
        if (maxAge != null && age > maxAge) throw new AgeRestrictionException();
    }

    private static Integer computeDuration(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return null;
        return (int) ChronoUnit.MINUTES.between(start, end);
    }
}
