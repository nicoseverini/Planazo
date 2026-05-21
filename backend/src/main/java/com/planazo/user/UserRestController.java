package com.planazo.user;

import com.planazo.user.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "1 - Users")
class UserRestController {
        private final UserService userService;

        @Autowired
        UserRestController(UserService userService) {
                this.userService = userService;
        }

        @PreAuthorize("isAuthenticated()")
        @GetMapping(value = "/profile/me", produces = "application/json")
        @Operation(summary = "View your profile")
        @ResponseStatus(HttpStatus.OK)
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        ResponseEntity<UserProfileDTO> viewMyProfile(
                        @AuthenticationPrincipal(expression = "username") String email) {
                return userService.getUserProfileByEmail(email)
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        }

        @PreAuthorize("isAuthenticated()")
        @GetMapping(value = "/profile/{id}", produces = "application/json")
        @Operation(summary = "View a user's profile by ID")
        @ResponseStatus(HttpStatus.OK)
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        ResponseEntity<UserProfileDTO> viewProfile(
                        @PathVariable Long id) {
                return userService.getUserProfileById(id)
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        }

        @PreAuthorize("isAuthenticated()")
        @DeleteMapping(value = "/delete/me", produces = "application/json")
        @Operation(summary = "Delete yourself")
        @ResponseStatus(HttpStatus.OK)
        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
        ResponseEntity<StatusResponseDTO> deleteUser(
                        @AuthenticationPrincipal(expression = "username") String email) {
                var currentUser = userService.getUserByEmail(email);
                return userService.deleteUser(currentUser.getId())
                                .map(user -> ResponseEntity.ok(new StatusResponseDTO("success", "User deleted")))
                                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                                                .body(new StatusResponseDTO("error", "User not found")));
        }

        @PreAuthorize("hasRole('ADMIN')")
        @PatchMapping(value = "/admin/update/{id}", produces = "application/json")
        @Operation(summary = "Update an admin (admin only)")
        @ResponseStatus(HttpStatus.OK)
        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
        Optional<ResponseEntity<StatusResponseDTO>> updateAdmin(
                        @PathVariable Long id,
                        @RequestBody UserUpdateDTO userDTO) {
                return userService.updateAdmin(id, userDTO);
        }

        @PreAuthorize("hasRole('ADMIN')")
        @PostMapping(value = "/admin/create", produces = "application/json")
        @Operation(summary = "Create an admin (admin only)")
        @ResponseStatus(HttpStatus.OK)
        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        @ApiResponse(responseCode = "409", description = "Email already register", content = @Content)
        ResponseEntity<StatusResponseDTO> createAdmin(
                        @RequestBody UserCreateDTO userDTO) {
                return userService.createUser(userDTO)
                                .map(status -> ResponseEntity.status(HttpStatus.CREATED).body(status))
                                .orElse(ResponseEntity.status(HttpStatus.CONFLICT)
                                                .body(new StatusResponseDTO("error", "Email already in use")));
        }

        @PreAuthorize("isAuthenticated()")
        @PatchMapping(value = "/update/me", produces = "application/json")
        @Operation(summary = "Update yourself")
        @ResponseStatus(HttpStatus.OK)
        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
        Optional<ResponseEntity<StatusResponseDTO>> updateUser(
                        @RequestBody UserUpdateDTO userDTO,
                        @AuthenticationPrincipal(expression = "username") String email) {
                var currentUser = userService.getUserByEmail(email);
                return userService.updateUser(userDTO, currentUser.getId());
        }

        @PreAuthorize("hasRole('ADMIN')")
        @DeleteMapping(value = "/admin/delete/{id}", produces = "application/json")
        @Operation(summary = "Delete a user or admin (admin only)")
        @ResponseStatus(HttpStatus.OK)
        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
        @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
        ResponseEntity<StatusResponseDTO> deleteUser(
                        @PathVariable Long id) {
                return userService.deleteUser(id)
                                .map(user -> ResponseEntity.ok(new StatusResponseDTO("success", "User deleted")))
                                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                                                .body(new StatusResponseDTO("error", "User not found")));
        }
}