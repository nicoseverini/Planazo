package com.planazo.plan;

import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;
import com.planazo.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;
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

    @Column(nullable = false)
    private LocalDateTime dateTime;

    // Duration in minutes
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

    @Enumerated(EnumType.STRING)
    @Column
    private TravelType travelType;

    // Free-text address / zone
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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "plan_subscribers",
            joinColumns = @JoinColumn(name = "plan_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> subscribers = new ArrayList<>();

    @Column(nullable = false)
    private Boolean active = true;

    public Plan() {}

    public Plan(String title, String description, LocalDateTime dateTime, Integer durationMinutes,
                PlanVisibility visibility, Integer maxSubscribers, Integer minAge, Integer maxAge,
                List<Interest> interests, TravelType travelType, String location,Double latitude, Double longitude, List<String> images, User creator) {
        this.title = title;
        this.description = description;
        this.dateTime = dateTime;
        this.durationMinutes = durationMinutes;
        this.visibility = visibility;
        this.maxSubscribers = maxSubscribers;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.interests = interests == null ? new ArrayList<>() : new ArrayList<>(interests);
        this.travelType = travelType;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.images = images == null ? new ArrayList<>() : new ArrayList<>(images);
        this.creator = creator;
        this.active = true;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
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
    public TravelType getTravelType() { return travelType; }
    public void setTravelType(TravelType travelType) { this.travelType = travelType; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images == null ? new ArrayList<>() : new ArrayList<>(images); }
    public User getCreator() { return creator; }
    public List<User> getSubscribers() { return subscribers; }
    public void setSubscribers(List<User> subscribers) { this.subscribers = subscribers; }
    public Boolean isActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public boolean isFull() {
        return maxSubscribers != null && subscribers.size() >= maxSubscribers;
    }
}