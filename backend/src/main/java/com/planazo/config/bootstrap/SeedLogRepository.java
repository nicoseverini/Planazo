package com.planazo.config.bootstrap;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SeedLogRepository extends JpaRepository<SeedLog, String> {
}
