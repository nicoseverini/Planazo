package com.planazo.user;

import com.planazo.config.security.JwtService;
import com.planazo.config.security.JwtUserDetails;
import com.planazo.user.dto.*;
import com.planazo.user.refresh_token.RefreshToken;
import com.planazo.user.refresh_token.RefreshTokenService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
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

    @Autowired
    UserService(
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RefreshTokenService refreshTokenService) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
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
            try {
                userRepository.save(user);
                return Optional.of(generateTokens(user));
            } catch (DataIntegrityViolationException ex) {
                return Optional.empty();
            }
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
                        user.getBirthDate(),
                        user.getInterests(),
                        user.getBudget(),
                        user.getTravelType(),
                        user.getLanguages()));
    }

    Optional<UserProfileDTO> getUserProfileByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(user -> new UserProfileDTO(
                        user.getId(),
                        user.getEmail(),
                        user.getName(),
                        user.getLastname(),
                        user.getPhoto(),
                        user.getGender(),
                        user.getBirthDate(),
                        user.getInterests(),
                        user.getBudget(),
                        user.getTravelType(),
                        user.getLanguages()));
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
                    if (userDTO.interests() != null) {
                        findedUser.setInterests(userDTO.interests());
                    }
                    if (userDTO.budget() != null) {
                        findedUser.setBudget(userDTO.budget());
                    }
                    if (userDTO.travelType() != null) {
                        findedUser.setTravelType(userDTO.travelType());
                    }
                    if (userDTO.languages() != null) {
                        findedUser.setLanguages(userDTO.languages());
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
                    if (userDTO.interests() != null) {
                        findedUser.setInterests(userDTO.interests());
                    }
                    if (userDTO.budget() != null) {
                        findedUser.setBudget(userDTO.budget());
                    }
                    if (userDTO.travelType() != null) {
                        findedUser.setTravelType(userDTO.travelType());
                    }
                    if (userDTO.languages() != null) {
                        findedUser.setLanguages(userDTO.languages());
                    }
                    if (userDTO.password() != null) {
                        findedUser.setPassword(userDTO.password());
                    }

                    userRepository.save(findedUser);
                    return ResponseEntity.status(HttpStatus.OK).body(new StatusResponseDTO("success", "User updated"));
                });
    }
}