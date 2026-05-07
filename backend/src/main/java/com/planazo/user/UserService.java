package com.planazo.user;

import com.planazo.config.security.JwtService;
import com.planazo.config.security.JwtUserDetails;
import com.planazo.user.dto.*;
import com.planazo.user.refresh_token.RefreshToken;
import com.planazo.user.refresh_token.RefreshTokenService;
import com.planazo.user.verification.VerificationTokenService;
import com.planazo.user.verification.VerificationToken;
import com.planazo.user.change_password.ChangePasswordToken;
import com.planazo.user.change_password.ChangePasswordTokenService;
import com.planazo.user.email_service.EmailService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.Optional;

@Service
@Transactional
public class UserService implements UserDetailsService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final VerificationTokenService verificationTokenService;
    private final ChangePasswordTokenService changePasswordTokenService;
    private final EmailService emailService;

    @Autowired
    UserService(
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RefreshTokenService refreshTokenService, 
            VerificationTokenService verificationTokenService, 
            ChangePasswordTokenService changePasswordTokenService,
            EmailService emailService) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.verificationTokenService = verificationTokenService;
        this.changePasswordTokenService = changePasswordTokenService;
        this.emailService = emailService;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> {
                    var msg = String.format("Email '%s' not found", email);
                    return new UsernameNotFoundException(msg);
                });
    }

    Optional<TokenDTO> createUser(UserCreateDTO data) {
        if (userRepository.findByEmail(data.email()).isPresent()) {
        return Optional.empty();
        } else {
            var user = data.asUser(passwordEncoder::encode);
            userRepository.save(user);

            VerificationToken vToken = verificationTokenService.createFor(user);
            emailService.sendVerificationEmail(user.getEmail(), vToken.getToken());
            return Optional.of(generateTokens(user));
        }
    }

    Optional<TokenDTO> loginUser(UserCredentials data) {
        Optional<User> maybeUser = userRepository.findByEmail(data.email());
        return maybeUser
                .filter(user -> passwordEncoder.matches(data.password(), user.getPassword()))
                .map(this::generateTokens);
    }

    Optional<TokenDTO> refresh(RefreshDTO data) {
        return refreshTokenService.findByValue(data.refreshToken())
                .map(RefreshToken::user)
                .map(this::generateTokens);
    }

    Optional<UserProfileDTO> getUserProfileById(Long id) {
        return userRepository.findById(id)
                .map(user -> new UserProfileDTO(
                        user.getId(),
                        user.getEmail(),
                        user.getName(),
                        user.getLastname(),
                        user.getPhoto(),
                        user.getGender(),
                        user.getBirthDate()));
    }

    Optional<User> deleteUser(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            refreshTokenService.deleteByUser(user.get());
            userRepository.delete(user.get());
        }
        return user;
    }

    private TokenDTO generateTokens(User user) {
        String accessToken = jwtService.createToken(new JwtUserDetails(
                user.getUsername(),
                user.getRole()));
        RefreshToken refreshToken = refreshTokenService.createFor(user);
        return new TokenDTO(accessToken, refreshToken.value());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    public Optional<ResponseEntity<StatusResponseDTO>> updateAdmin(Long id, UserUpdateDTO userDTO) {
        return userRepository.findById(id)
                .map(findedUser -> {
                    if (!"ADMIN".equals(findedUser.getRole())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new StatusResponseDTO("error", "User not found"));
                    }

                    if (userDTO.name() != null) {
                        findedUser.setName(userDTO.name());
                    }
                    if (userDTO.lastname() != null) {
                        findedUser.setLastname(userDTO.lastname());
                    }
                    if (userDTO.gender() != null) {
                        findedUser.setGender(userDTO.gender());
                    }
                    if (userDTO.photo() != null) {
                        findedUser.setPhoto(userDTO.photo());
                    }
                    if (userDTO.birthDate() != null) {
                        findedUser.setBirthDate(userDTO.birthDate());
                    }
                    if (userDTO.password() != null) {
                        findedUser.setPassword(userDTO.password());
                    }

                    userRepository.save(findedUser);
                    return ResponseEntity.status(HttpStatus.OK).body(new StatusResponseDTO("success", "Admin updated"));
                });
    }

    public Optional<ResponseEntity<StatusResponseDTO>> updateUser(UserUpdateDTO userDTO, Long id) {
        return userRepository.findById(id)
                .map(findedUser -> {
                    if (userDTO.name() != null) {
                        findedUser.setName(userDTO.name());
                    }
                    if (userDTO.lastname() != null) {
                        findedUser.setLastname(userDTO.lastname());
                    }
                    if (userDTO.gender() != null) {
                        findedUser.setGender(userDTO.gender());
                    }
                    if (userDTO.photo() != null) {
                        findedUser.setPhoto(userDTO.photo());
                    }
                    if (userDTO.birthDate() != null) {
                        findedUser.setBirthDate(userDTO.birthDate());
                    }
                    if (userDTO.password() != null) {
                        findedUser.setPassword(userDTO.password());
                    }

                    userRepository.save(findedUser);
                    return ResponseEntity.status(HttpStatus.OK).body(new StatusResponseDTO("success", "User updated"));
                });
    }

    public boolean verifyUserAccount(String tokenValue) {
        Optional<VerificationToken> vTokenOpt = verificationTokenService.findByVerifiedToken(tokenValue);

        if (vTokenOpt.isPresent()) {
            VerificationToken vToken = vTokenOpt.get();
            User user = vToken.getUser();
            user.setVerified(true);
            userRepository.save(user);
            verificationTokenService.deleteToken(vToken);    
            return true;
        }
        return false;
    }
    public boolean requestPasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            ChangePasswordToken token = changePasswordTokenService.createFor(user);
            emailService.sendPasswordResetEmail(user.getEmail(), token.getToken());
            return true;
        }
        return false;
    }
    public boolean changePassword(String tokenValue, String newPassword) {
        Optional<ChangePasswordToken> vTokenOpt = changePasswordTokenService.findByVerifiedToken(tokenValue);

        if (vTokenOpt.isPresent()) {
            ChangePasswordToken vToken = vTokenOpt.get();
            User user = vToken.getUser();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            changePasswordTokenService.deleteToken(vToken);    
            return true;
        }
        return false;
    }
}