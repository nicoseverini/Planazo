package com.planazo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseExtensionConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseExtensionConfig.class);

    @Bean
    ApplicationRunner enablePostgresExtensions(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS unaccent");
                log.info("PostgreSQL unaccent extension is available.");
            } catch (Exception e) {
                log.warn("Could not enable unaccent extension — accent-insensitive location search will be unavailable: {}", e.getMessage());
            }
        };
    }
}
