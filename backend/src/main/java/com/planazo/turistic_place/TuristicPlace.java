package com.planazo.turistic_place;

import com.planazo.common.constants.Interest;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "turistic_places")
public class TuristicPlace {
    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double cost;

    @Column(name = "min_age")
    private Integer minAge;

    @Column(name = "max_age")
    private Integer maxAge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Interest interest;

    @Column
    private String location;

    private Double latitude;

    private Double longitude;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "turistic_place_images", joinColumns = @JoinColumn(name = "id_place"))
    @Column(name = "image", columnDefinition = "TEXT")
    private List<String> images = new ArrayList<>();

    public TuristicPlace() {
    }

    public TuristicPlace(String name, Double cost, Integer minAge, Integer maxAge, Interest interest,
                         String location, Double latitude, Double longitude, List<String> images) {
        this.name = name;
        this.cost = cost;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.interest = interest;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.images = images == null ? new ArrayList<>() : new ArrayList<>(images);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public Integer getMinAge() {
        return minAge;
    }

    public void setMinAge(Integer minAge) {
        this.minAge = minAge;
    }

    public Integer getMaxAge() {
        return maxAge;
    }

    public void setMaxAge(Integer maxAge) {
        this.maxAge = maxAge;
    }

    public Interest getInterest() {
        return interest;
    }

    public void setInterest(Interest interest) {
        this.interest = interest;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images == null ? new ArrayList<>() : new ArrayList<>(images);
    }
}