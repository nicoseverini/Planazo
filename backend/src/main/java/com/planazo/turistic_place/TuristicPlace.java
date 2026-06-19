package com.planazo.turistic_place;

import com.planazo.common.constants.Interest;
import com.planazo.user.User;
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
import jakarta.persistence.ManyToOne;
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

    @Column
    private Double cost;

    @Column(name = "min_age")
    private Integer minAge;

    @Column(name = "max_age")
    private Integer maxAge;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "turistic_place_interests", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "interest", nullable = false)
    @Enumerated(EnumType.STRING)
    private List<Interest> interests = new ArrayList<>();

    @Column(length = 1000)
    private String description;

    @Column
    private String country;

    @Column
    private String city;

    @Column(name = "address_line")
    private String address;

    @Column
    private String location;

    private Double latitude;

    private Double longitude;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "turistic_place_images", joinColumns = @JoinColumn(name = "id_place"))
    @Column(name = "image", columnDefinition = "TEXT")
    private List<String> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    public TuristicPlace() {}

    public TuristicPlace(String name, Double cost, Integer minAge, Integer maxAge,
                         List<Interest> interests,
                         String country, String city, String address,
                         Double latitude, Double longitude, List<String> images) {
        this.name = name;
        this.cost = cost;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.interests = interests == null ? new ArrayList<>() : new ArrayList<>(interests);
        setLocationParts(country, city, address);
        this.latitude = latitude;
        this.longitude = longitude;
        this.images = images == null ? new ArrayList<>() : new ArrayList<>(images);
    }

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }

    public Integer getMinAge() { return minAge; }
    public void setMinAge(Integer minAge) { this.minAge = minAge; }

    public Integer getMaxAge() { return maxAge; }
    public void setMaxAge(Integer maxAge) { this.maxAge = maxAge; }

    public List<Interest> getInterests() { return interests; }
    public void setInterests(List<Interest> interests) {
        this.interests = interests == null ? new ArrayList<>() : new ArrayList<>(interests);
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCountry() { return country; }
    public String getCity() { return city; }
    public String getAddress() { return address; }
    public String getLocation() { return location; }

    public void setLocationParts(String country, String city, String address) {
        this.country = country != null ? country.trim() : null;
        this.city    = city    != null ? city.trim()    : null;
        this.address = address != null ? address.trim() : null;
        StringBuilder derived = new StringBuilder();
        if (this.address != null && !this.address.isBlank()) derived.append(this.address);
        if (this.city != null && !this.city.isBlank()) {
            if (derived.length() > 0) derived.append(", ");
            derived.append(this.city);
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
    public void setImages(List<String> images) {
        this.images = images == null ? new ArrayList<>() : new ArrayList<>(images);
    }

    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }
}
