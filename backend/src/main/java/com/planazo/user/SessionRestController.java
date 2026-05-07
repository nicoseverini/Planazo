package com.planazo.user;

import com.planazo.user.dto.RefreshDTO;
import com.planazo.user.dto.TokenDTO;
import com.planazo.user.dto.UserCreateDTO;
import com.planazo.user.dto.UserLoginDTO;
import com.planazo.user.dto.ChangePasswordDTO;
import com.planazo.user.dto.ForgotPasswordDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import com.planazo.user.verification.VerificationTokenService;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PatchMapping;


@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication")
class SessionRestController {

    private final UserService userService;
    
    @Autowired
    SessionRestController(UserService userService) {
                this.userService = userService;
    }

    @PreAuthorize("permitAll()")
    @PostMapping(value = "/signup", produces = "application/json")
    @Operation(summary = "Create a new user")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "409", description = "Email already used", content = @Content)
    ResponseEntity<TokenDTO> signUp(
            @Valid @NonNull @RequestBody UserCreateDTO data
    ) throws MethodArgumentNotValidException {
        return userService.createUser(data)
                .map(tk -> ResponseEntity.status(HttpStatus.CREATED).body(tk))
                .orElse(ResponseEntity.status(HttpStatus.CONFLICT).build());
    }

    @PreAuthorize("permitAll()")
    @PostMapping(value = "/token", produces = "application/json")
    @Operation(summary = "Log in, creating a new session")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "401", description = "Invalid email or password supplied", content = @Content)
    public TokenDTO login(
            @Valid @NonNull @RequestBody UserLoginDTO data
    ) throws MethodArgumentNotValidException {
        return userService
                .loginUser(data)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
    }

    @PreAuthorize("permitAll()")
    @PostMapping(value = "/refresh", produces = "application/json")
    @Operation(summary = "Refresh a session")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "401", description = "Invalid refresh token supplied", content = @Content)
    public TokenDTO refresh(
            @Valid @NonNull @RequestBody RefreshDTO data
    ) throws MethodArgumentNotValidException {
        return userService
                .refresh(data)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
    }

	@PreAuthorize("permitAll()")
    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset email")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordDTO data) {
        userService.requestPasswordReset(data.email());
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("permitAll()")
    @PostMapping("/change-password")
    @Operation(summary = "Change password using a reset token")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordDTO data) {
        if (userService.changePassword(data.token(), data.newPassword())) {
            return ResponseEntity.ok().build();
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired token");
    }

    @PreAuthorize("permitAll()")
    @PatchMapping("/verify_user")
    @Operation(summary = "Verify user account via email token")
    @ApiResponse(responseCode = "400", description = "Invalid or expired token", content = @Content)
    @ResponseStatus(HttpStatus.OK)
    public void verifyUser(@RequestParam("token") String token) {
        if (!userService.verifyUserAccount(token)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired token");
        }
}
}