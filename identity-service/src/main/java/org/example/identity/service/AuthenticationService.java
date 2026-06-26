package org.example.identity.service;

import com.nimbusds.jose.*;
import java.text.ParseException;
import java.util.Date;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.identity.exception.AppException;
import org.example.identity.exception.ErrorCode;
import org.example.identity.dto.request.AuthenticationRequest;
import org.example.identity.dto.request.IntrospectRequest;
import org.example.identity.dto.request.LogoutRequest;
import org.example.identity.dto.request.RefreshRequest;
import org.example.identity.dto.response.AuthenticationResponse;
import org.example.identity.dto.response.IntrospectResponse;
import org.example.identity.entity.InvalidatedToken;
import org.example.identity.entity.User;
import org.example.identity.repository.InvalidatedTokenRepository;
import org.example.identity.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

/**
 * Authentication service handling login, logout, token refresh, and
 * introspection.
 * Refactored to follow Single Responsibility Principle.
 * 
 * Responsibilities split into:
 * - AuthenticationService (this): Authentication flow only
 * - JwtTokenService: Token generation and verification
 */
@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    PasswordEncoder passwordEncoder;
    JwtTokenService jwtTokenService;
    AuthenticationResponseFactory authenticationResponseFactory;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        log.debug("Introspecting token: {}", token.substring(0, Math.min(20, token.length())) + "...");

        boolean isValid = true;

        try {
            jwtTokenService.verifyToken(token, false);
            log.debug("Token introspection successful - token is valid");
        } catch (AppException e) {
            log.warn("Token introspection failed: {}", e.getMessage());
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    /**
     * Authenticate user by identifier (email OR username) and password.
     */
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        String identifier = request.getEffectiveIdentifier();
        if (identifier == null || identifier.isBlank()) {
            log.warn("Authentication failed - no identifier provided");
            throw new AppException(ErrorCode.IDENTIFIER_REQUIRED);
        }

        log.info("Authentication attempt for identifier: {}", identifier);

        User user = userRepository
                .findByIdentifierWithRoles(identifier)
                .orElseThrow(() -> {
                    log.warn("Authentication failed - identifier not found: {}", identifier);
                    return new AppException(ErrorCode.INVALID_CREDENTIALS);
                });

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            log.warn("Authentication failed - local password not set for identifier: {}", identifier);
            throw new AppException(ErrorCode.PASSWORD_NOT_SET);
        }

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {
            log.warn("Authentication failed - invalid password for identifier: {}", identifier);
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        authenticationResponseFactory.validateUserCanAuthenticate(user, identifier);

        String primaryRole = authenticationResponseFactory.determinePrimaryRole(user);
        var token = jwtTokenService.generateToken(user, primaryRole);
        log.info("Authentication successful for identifier: {} - token generated, role: {}",
                identifier, primaryRole);

        return authenticationResponseFactory.buildAuthResponse(user, primaryRole, token);
    }

    /**
     * Get current user info (for /api/v1/auth/me endpoint).
     */
    public AuthenticationResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Long userId = getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String primaryRole = authenticationResponseFactory.determinePrimaryRole(user);
        return authenticationResponseFactory.buildAuthResponse(user, primaryRole, null);
    }

    /**
     * Get the current authenticated user's ID from JWT claims.
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            Object userIdClaim = jwt.getClaim("user_id");
            if (userIdClaim instanceof Number num) {
                return num.longValue();
            }
            if (userIdClaim instanceof String str) {
                try {
                    return Long.parseLong(str);
                } catch (NumberFormatException e) {
                    log.warn("Cannot parse user_id from JWT: {}", str);
                }
            }
        }
        return null;
    }

    /**
     * Get the current authenticated user's primary role from JWT claims.
     */
    public String getCurrentRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            Object roleClaim = jwt.getClaim("role");
            if (roleClaim instanceof String role) {
                return role;
            }
        }
        return null;
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        log.info("Logout attempt for token: {}",
                request.getToken().substring(0, Math.min(20, request.getToken().length())) + "...");

        try {
            var signToken = jwtTokenService.verifyToken(request.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .id(jit)
                    .expiryTime(expiryTime)
                    .build();

            invalidatedTokenRepository.save(invalidatedToken);
            log.info("Token invalidated successfully - JIT: {}", jit);
        } catch (AppException exception) {
            log.info("Logout - Token already expired or invalid");
        }
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        log.info("Token refresh attempt");

        var signedJWT = jwtTokenService.verifyToken(request.getToken(), true);

        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
        log.debug("Old token invalidated - JIT: {}", jit);

        var email = signedJWT.getJWTClaimsSet().getClaim("email");
        String identifier = email != null ? email.toString() : signedJWT.getJWTClaimsSet().getSubject();
        log.debug("Refreshing token for identifier: {}", identifier);

        var user = userRepository.findByIdentifierWithRoles(identifier)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        authenticationResponseFactory.validateUserCanAuthenticate(user, identifier);
        String primaryRole = authenticationResponseFactory.determinePrimaryRole(user);
        var token = jwtTokenService.generateToken(user, primaryRole);
        log.info("Token refreshed successfully for identifier: {}", identifier);

        return authenticationResponseFactory.buildAuthResponse(user, primaryRole, token);
    }
}
