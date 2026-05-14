package com.planazo.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;
import java.nio.charset.StandardCharsets;

@Service
public class JwtService {

    private final String secret;
    private final Long expiration;

    @Autowired
    public JwtService(
            @Value("${jwt.access.secret}") String secret,
            @Value("${jwt.access.expiration}") Long expiration
    ) {
        this.secret = secret;
        this.expiration = expiration;
    }

    public String createToken(JwtUserDetails claims) {
        String role = claims.role().startsWith("ROLE_")
                ? claims.role()
                : "ROLE_" + claims.role();

        return Jwts.builder()
                .subject(claims.username())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .claim("role", role)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public Optional<JwtUserDetails> extractVerifiedUserDetails(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (claims.getSubject() != null && claims.get("role") instanceof String role) {
                return Optional.of(new JwtUserDetails(claims.getSubject(), role));
            }
        } catch (Exception e) {
            // TODO: Tenemos que handlear el error
        }
        return Optional.empty();
    }

    private SecretKey getSigningKey() {
        try {
            byte[] bytes = Decoders.BASE64.decode(secret);
            ensureKeyLength(bytes);
            return Keys.hmacShaKeyFor(bytes);
        } catch (RuntimeException ex) {
            // Fallback for raw (non-base64) secrets.
            byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
            ensureKeyLength(bytes);
            return Keys.hmacShaKeyFor(bytes);
        }
    }

    private void ensureKeyLength(byte[] bytes) {
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret demasiado corto. Usa al menos 32 bytes (256 bits) para HS256."
            );
        }
    }
}
