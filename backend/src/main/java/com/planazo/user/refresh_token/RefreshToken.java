package com.planazo.user.refresh_token;

import com.planazo.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.Instant;

@Entity
public class RefreshToken {
    @Id
    private String content;

    @Column(name = "token_value")
    private String value;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private Instant expiresAt;

    public RefreshToken() {}

    public RefreshToken(String content, User user, Instant expiresAt) {
        this.content = content;
        this.user = user;
        this.expiresAt = expiresAt;
    }

    public String value() {
        return this.content;
    }

    public User user() {
        return this.user;
    }

    public boolean isValid() {
        return expiresAt.isAfter(Instant.now());
    }
}
