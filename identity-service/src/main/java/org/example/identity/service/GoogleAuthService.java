package org.example.identity.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.Locale;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.identity.constant.PredefinedRole;
import org.example.identity.enums.UserStatus;
import org.example.identity.exception.AppException;
import org.example.identity.exception.ErrorCode;
import org.example.identity.dto.request.GoogleAuthRequest;
import org.example.identity.dto.response.AuthenticationResponse;
import org.example.identity.entity.Role;
import org.example.identity.entity.User;
import org.example.identity.repository.RoleRepository;
import org.example.identity.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GoogleAuthService {

    GoogleIdTokenVerifierPort googleIdTokenVerifier;
    UserRepository userRepository;
    RoleRepository roleRepository;
    JwtTokenService jwtTokenService;
    AuthenticationResponseFactory authenticationResponseFactory;

    @Transactional
    public AuthenticationResponse authenticate(GoogleAuthRequest request) {
        VerifiedGoogleToken googleToken = googleIdTokenVerifier.verify(request.getIdToken());
        String googleId = googleToken.googleId();
        String email = normalizeEmail(googleToken.email());

        if (googleId == null || googleId.isBlank() || email == null || email.isBlank()) {
            throw new AppException(ErrorCode.GOOGLE_AUTH_FAILED);
        }

        if (Boolean.FALSE.equals(googleToken.emailVerified())) {
            throw new AppException(ErrorCode.GOOGLE_EMAIL_NOT_VERIFIED);
        }

        User user = userRepository.findByGoogleIdWithRoles(googleId)
                .orElseGet(() -> findLinkOrCreateUser(googleToken, googleId, email));

        authenticationResponseFactory.validateUserCanAuthenticate(user, email);
        String primaryRole = authenticationResponseFactory.determinePrimaryRole(user);
        String token = jwtTokenService.generateToken(user, primaryRole);

        log.info("Google authentication successful for userId: {}, email: {}, role: {}",
                user.getId(), user.getEmail(), primaryRole);

        return authenticationResponseFactory.buildAuthResponse(user, primaryRole, token);
    }

    private User findLinkOrCreateUser(VerifiedGoogleToken googleToken, String googleId, String email) {
        return userRepository.findByEmailIgnoreCaseWithRoles(email)
                .map(existingUser -> linkExistingUser(existingUser, googleToken, googleId))
                .orElseGet(() -> createGoogleUser(googleToken, googleId, email));
    }

    private User linkExistingUser(User user, VerifiedGoogleToken googleToken, String googleId) {
        if (user.getGoogleId() != null && !user.getGoogleId().equals(googleId)) {
            throw new AppException(ErrorCode.GOOGLE_ACCOUNT_CONFLICT);
        }

        authenticationResponseFactory.validateUserCanAuthenticate(user, user.getEmail());

        user.setGoogleId(googleId);
        if ((user.getFullName() == null || user.getFullName().isBlank())
                && googleToken.fullName() != null
                && !googleToken.fullName().isBlank()) {
            user.setFullName(googleToken.fullName().trim());
        }

        return userRepository.save(user);
    }

    private User createGoogleUser(VerifiedGoogleToken googleToken, String googleId, String email) {
        Role buyerRole = roleRepository.findByCode(PredefinedRole.BUYER_ROLE)
                .orElseThrow(() -> new AppException(ErrorCode.GOOGLE_DEFAULT_ROLE_MISSING));

        HashSet<Role> roles = new HashSet<>();
        roles.add(buyerRole);

        User user = User.builder()
                .username(resolveUsername(email, googleId))
                .email(email)
                .googleId(googleId)
                .fullName(trimToNull(googleToken.fullName()))
                .password(null)
                .status(UserStatus.ACTIVE)
                .roles(roles)
                .joinedDate(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String resolveUsername(String email, String googleId) {
        if (email.length() <= 255 && !userRepository.existsByUsername(email)) {
            return email;
        }

        String hash = sha256Hex(googleId);
        String username = "google_" + hash.substring(0, 12);
        if (!userRepository.existsByUsername(username)) {
            return username;
        }

        return "google_" + hash.substring(0, 24);
    }

    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
