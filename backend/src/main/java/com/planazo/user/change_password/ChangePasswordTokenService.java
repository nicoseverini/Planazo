package com.planazo.user.change_password;

import com.planazo.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChangePasswordTokenService {

    private final ChangePasswordTokenRepository tokenRepository;

    @Autowired
    public ChangePasswordTokenService(ChangePasswordTokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    public ChangePasswordToken createFor(User user) {
        String value = UUID.randomUUID().toString();
        ChangePasswordToken token = new ChangePasswordToken(value, user);        
        return tokenRepository.save(token);
    }

    public Optional<ChangePasswordToken> findByVerifiedToken(String value) {
        return tokenRepository.findByToken(value)
                .filter(token -> !token.isExpired());
    }
    public void deleteToken(ChangePasswordToken token) {
        tokenRepository.delete(token);
    }
}