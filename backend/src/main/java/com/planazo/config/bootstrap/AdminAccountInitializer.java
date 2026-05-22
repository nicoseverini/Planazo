package com.planazo.config.bootstrap;

import com.planazo.user.User;
import com.planazo.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class AdminAccountInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;
    private final String adminLastname;
    private final String adminGender;
    private final String adminPhoto;
    private final LocalDate adminBirthDate;

    public AdminAccountInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword,
            @Value("${app.admin.name}") String adminName,
            @Value("${app.admin.lastname}") String adminLastname,
            @Value("${app.admin.gender}") String adminGender,
            @Value("${app.admin.photo}") String adminPhoto,
            @Value("${app.admin.birth-date}") LocalDate adminBirthDate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminName = adminName;
        this.adminLastname = adminLastname;
        this.adminGender = adminGender;
        this.adminPhoto = adminPhoto;
        this.adminBirthDate = adminBirthDate;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void ensureAdminAccount() {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseGet(User::new);

        admin.setEmail(adminEmail);
        admin.setName(adminName);
        admin.setLastname(adminLastname);
        admin.setGender(adminGender);
        admin.setPhoto(adminPhoto);
        admin.setBirthDate(adminBirthDate);
        admin.setRole("ADMIN");
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setVerified(true);

        userRepository.save(admin);
    }
}