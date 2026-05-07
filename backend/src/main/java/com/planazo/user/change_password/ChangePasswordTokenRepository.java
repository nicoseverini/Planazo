package com.planazo.user.change_password;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ChangePasswordTokenRepository extends JpaRepository<ChangePasswordToken, Long> {
    Optional<ChangePasswordToken> findByToken(String token);
}