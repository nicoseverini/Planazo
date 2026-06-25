package com.planazo.user;

import com.planazo.config.security.JwtService;
import com.planazo.config.security.JwtUserDetails;
import com.planazo.plan.Plan;
import com.planazo.plan.PlanRepository;
import com.planazo.plan.PlanSubscriber;
import com.planazo.plan.PlanSubscriberRepository;
import com.planazo.tourist_place.TouristPlaceRepository;
import com.planazo.user.dto.*;
import com.planazo.user.refresh_token.RefreshToken;
import com.planazo.user.refresh_token.RefreshTokenService;
import com.planazo.user.verification.VerificationTokenService;
import com.planazo.user.verification.VerificationTokenRepository;
import com.planazo.user.verification.VerificationToken;
import com.planazo.user.change_password.ChangePasswordTokenService;
import com.planazo.user.change_password.ChangePasswordTokenRepository;
import com.planazo.user.change_password.ChangePasswordToken;
import com.planazo.user.email_service.EmailService;
import com.planazo.report.ReportRepository;
import com.planazo.review.ReviewRepository;
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
import org.springframework.web.server.ResponseStatusException;


import java.util.Optional;
import java.util.List;

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
    private final PlanSubscriberRepository planSubscriberRepository;
    private final PlanRepository planRepository;
    private final TouristPlaceRepository touristPlaceRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final ChangePasswordTokenRepository changePasswordTokenRepository;
    private final ReportRepository reportRepository;
    private final ReviewRepository reviewRepository;

    @Autowired
    UserService(
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RefreshTokenService refreshTokenService,
            VerificationTokenService verificationTokenService,
            ChangePasswordTokenService changePasswordTokenService,
            EmailService emailService,
            PlanSubscriberRepository planSubscriberRepository,
            PlanRepository planRepository,
            TouristPlaceRepository touristPlaceRepository,
            VerificationTokenRepository verificationTokenRepository,
            ChangePasswordTokenRepository changePasswordTokenRepository,
            ReportRepository reportRepository,
            ReviewRepository reviewRepository) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.verificationTokenService = verificationTokenService;
        this.changePasswordTokenService = changePasswordTokenService;
        this.emailService = emailService;
        this.planSubscriberRepository = planSubscriberRepository;
        this.planRepository = planRepository;
        this.touristPlaceRepository = touristPlaceRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.changePasswordTokenRepository = changePasswordTokenRepository;
        this.reportRepository = reportRepository;
        this.reviewRepository = reviewRepository;
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

    Optional<StatusResponseDTO> createUser(UserCreateDTO data) {
        if (userRepository.findByEmail(data.email()).isPresent()) {
            return Optional.empty();
        }

        var user = data.asUser(passwordEncoder::encode);
        try {
            userRepository.save(user);
            VerificationToken vToken = verificationTokenService.createFor(user);
            emailService.sendVerificationEmail(user.getEmail(), vToken.getToken());
            return Optional.of(new StatusResponseDTO("success", "User created. Check your email to verify your account."));
        } catch (DataIntegrityViolationException dive) {
            return Optional.empty();
        } catch (Exception ex) {
            throw new RuntimeException("Error occurred while creating user: " + ex.getMessage());
        }
    }

    Optional<TokenDTO> loginUser(UserCredentials data) {

        Optional<User> maybeUser = userRepository.findByEmail(data.email());

        if (maybeUser.isEmpty() || !passwordEncoder.matches(data.password(), maybeUser.get().getPassword())) {
            return Optional.empty();
        }

        User user = maybeUser.get();

        if (!Boolean.TRUE.equals(user.isVerified())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account not verified");
        }
        return Optional.of(this.generateTokens(user));
    }

    Optional<TokenDTO> loginUserAdmin(UserCredentials data) {
        Optional<User> maybeUser = userRepository.findByEmail(data.email());
        return maybeUser
                .filter(user -> "ADMIN".equals(user.getRole()))
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
                        user.getTravelType(),
                        user.getLanguages(),
                        user.getPreferredLanguage()));
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
                        user.getTravelType(),
                        user.getLanguages(),
                        user.getPreferredLanguage()));
    }

    Optional<User> deleteUser(Long id, String reason) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User managedUser = user.get();
            String userEmail = managedUser.getEmail();
            String userName = managedUser.getName();

            reportRepository.deleteByReporterId(id);
            reportRepository.deleteByReportedUserId(id);

            reviewRepository.deleteByUserId(id);

            List<Plan> createdPlans = planRepository.findByCreatorId(id);
            for (Plan plan : createdPlans) {
                reportRepository.deleteByPlanId(plan.getId());
            }

            touristPlaceRepository.deleteByCreatorId(id);

            List<PlanSubscriber> subscriptions = planSubscriberRepository.findByUserIdWithPlan(id);
            for (PlanSubscriber sub : subscriptions) {
                Plan plan = sub.getPlan();
                if (!plan.getCreator().getId().equals(id) && sub.countsAsSubscriber()) {
                    plan.decrementSubscriberCount();
                }
            }
            planRepository.flush();

            planRepository.deleteAll(createdPlans);

            planSubscriberRepository.deleteByUserId(id);

            refreshTokenService.deleteByUser(managedUser);
            verificationTokenRepository.deleteByUser(managedUser);
            changePasswordTokenRepository.deleteByUser(managedUser);

            if (reason != null && !reason.isEmpty()) {
                emailService.sendUserDeletedEmail(userEmail, userName, reason);
            }

            userRepository.deleteById(managedUser.getId());
        }
        return user;
    }

    private TokenDTO generateTokens(User user) {
        String accessToken = jwtService.createToken(new JwtUserDetails(
                user.getUsername(),
                user.getRole(),
                user.getId()
        ));
        RefreshToken refreshToken = refreshTokenService.createFor(user);
        UserProfileDTO userProfile = new UserProfileDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getLastname(),
                user.getPhoto(),
                user.getGender(),
                user.getBirthDate(),
                user.getInterests(),
                user.getTravelType(),
                user.getLanguages(),
                user.getPreferredLanguage()
        );
        return new TokenDTO(accessToken, refreshToken.value(), userProfile);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    public boolean existsById(Long id) {
        return userRepository.existsById(id);
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

    public Optional<ResponseEntity<StatusResponseDTO>> updateUserLanguage(UserLanguageUpdateDTO languageDTO, Long id) {
        return userRepository.findById(id)
                .map(findedUser -> {
                    if (languageDTO.preferredLanguage() != null) {
                        findedUser.setPreferredLanguage(languageDTO.preferredLanguage());
                    }
                    userRepository.save(findedUser);
                    return ResponseEntity.status(HttpStatus.OK).body(new StatusResponseDTO("success", "Language updated"));
                });
    }

    public boolean verifyUserAccount(String tokenValue) {
        Optional<VerificationToken> vTokenOpt = verificationTokenService.findByVerifiedToken(tokenValue);

        if (vTokenOpt.isPresent()) {
            VerificationToken vToken = vTokenOpt.get();
            User user = vToken.getUser();

            user.setVerified(true);
            userRepository.save(user);

            verificationTokenService.deleteToken(tokenValue);
            
            return true;
        }
        return false;
    }

    public void resendVerificationEmail(String email) {
        userRepository.findByEmail(email)
                .filter(user -> !Boolean.TRUE.equals(user.isVerified()))
                .ifPresent(user -> {
                    VerificationToken token = verificationTokenService.createOrReplace(user);
                    emailService.sendVerificationEmail(user.getEmail(), token.getToken());
                });
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
            
            changePasswordTokenService.deleteToken(vToken);
            
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            return true;
        }
        return false;
    }
}