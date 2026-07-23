package com.planazo.user.change_password;

import com.planazo.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface ChangePasswordTokenRepository extends JpaRepository<ChangePasswordToken, Long> {
    Optional<ChangePasswordToken> findByToken(String token);

    @Transactional
    @Modifying
    @Query("DELETE FROM ChangePasswordToken cpt WHERE cpt.user = :user")
    void deleteByUser(User user);
}