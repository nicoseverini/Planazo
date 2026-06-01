package com.planazo.user.verification;

import com.planazo.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
public class VerificationTokenService {

    private final VerificationTokenRepository tokenRepository;

    @Autowired
    public VerificationTokenService(VerificationTokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    public VerificationToken createFor(User user) {
        String value = UUID.randomUUID().toString();
        VerificationToken token = new VerificationToken(value, user);        
        return tokenRepository.save(token);
    }

    public Optional<VerificationToken> findByVerifiedToken(String value) {
        return tokenRepository.findByToken(value)
                .filter(token -> !token.isExpired());
    }
    
    public void deleteToken(String token) {
        tokenRepository.deleteByToken(token);
    }
}