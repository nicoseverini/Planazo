package com.planazo.config.bootstrap;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Records which seed "batches" have already been applied, so each batch runs at
 * most once (the lightweight, hand-rolled equivalent of a migration version table).
 * See {@code seed_data_lote_impl.md}.
 */
@Entity
@Table(name = "seed_log")
public class SeedLog {

    @Id
    @Column(name = "version", nullable = false, updatable = false)
    private String version;

    @Column(name = "applied_at", nullable = false)
    private Instant appliedAt;

    protected SeedLog() {
    }

    public SeedLog(String version) {
        this.version = version;
        this.appliedAt = Instant.now();
    }

    public String getVersion() {
        return version;
    }

    public Instant getAppliedAt() {
        return appliedAt;
    }
}
